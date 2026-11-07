import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { DEFAULT_OPTIONS, TRACEPARENT_HEADER } from "@/constants/index.js";
import {
  formatTraceparent,
  generateSpanId,
  generateTraceId,
  getTraceContext,
  parseTraceparent,
  renewTraceContext,
  shouldPropagateTrace,
} from "@/core/trace.js";
import {
  initPageView,
  recordRoutePageView,
  resetPageView,
} from "@/core/pv-lifecycle.js";
import { destroy, flush, init, traceError } from "@/index.js";
import type { InitOptions } from "@/core/options-schema.js";
import { reportDataListSchema } from "@/reporter/report-data-schema.js";
import type { IReportData } from "@/types/index.js";
import { getBaseData, sentry } from "@/utils/index.js";
import { findPayload, getPayloads } from "./report-payloads.js";

const TRACEPARENT_VALUE_PATTERN = /^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/;

type FetchMock = Mock<
  [input: RequestInfo | URL, init?: RequestInit | undefined],
  Promise<Response>
>;

function initForHttp(overrides: Partial<Omit<InitOptions, "dsn">> = {}): void {
  init({
    dsn: "/api/log",
    enableClick: false,
    enableError: false,
    enableHashChange: false,
    enableHistory: false,
    enableUnhandledRejection: false,
    enableWhiteScreen: false,
    enableXhr: false,
    ...overrides,
  });
}

describe("trace identifiers", () => {
  it("generates W3C-shaped trace and span ids", () => {
    expect(generateTraceId()).toMatch(/^[0-9a-f]{32}$/);
    expect(generateSpanId()).toMatch(/^[0-9a-f]{16}$/);
    expect(generateTraceId()).not.toBe(generateTraceId());
    expect(generateSpanId()).not.toBe(generateSpanId());
  });

  it("formats and parses traceparent headers", () => {
    const traceId = generateTraceId();
    const spanId = generateSpanId();
    const header = formatTraceparent(traceId, spanId);
    expect(header).toBe(`00-${traceId}-${spanId}-01`);
    expect(parseTraceparent(header)).toEqual({ traceId, spanId });
  });

  it("rejects malformed traceparent headers", () => {
    expect(parseTraceparent(undefined)).toBeUndefined();
    expect(parseTraceparent("")).toBeUndefined();
    expect(parseTraceparent("garbage")).toBeUndefined();
    expect(
      parseTraceparent(
        "01-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
      ),
    ).toBeUndefined();
    expect(
      parseTraceparent("00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331"),
    ).toBeUndefined();
    expect(
      parseTraceparent(
        "00-00000000000000000000000000000000-b7ad6b7169203331-01",
      ),
    ).toBeUndefined();
    expect(
      parseTraceparent(
        "00-0af7651916cd43dd8448eb211c80319c-0000000000000000-01",
      ),
    ).toBeUndefined();
  });

  it("normalizes case and whitespace when parsing", () => {
    const parsed = parseTraceparent(
      " 00-0AF7651916CD43DD8448EB211C80319C-B7AD6B7169203331-01 ",
    );
    expect(parsed).toEqual({
      traceId: "0af7651916cd43dd8448eb211c80319c",
      spanId: "b7ad6b7169203331",
    });
  });
});

describe("ambient trace context", () => {
  afterEach(() => {
    sentry.setOptions({
      ...DEFAULT_OPTIONS,
      tracePropagationTargets: undefined,
    });
  });

  it("stamps every base payload with the active trace id", () => {
    const before = getTraceContext().traceId;
    expect(getBaseData().traceId).toBe(before);
    const renewed = renewTraceContext();
    expect(renewed.traceId).not.toBe(before);
    expect(getBaseData().traceId).toBe(renewed.traceId);
  });

  it("propagates to same-origin urls by default", () => {
    expect(shouldPropagateTrace("/api/orders")).toBe(true);
    expect(shouldPropagateTrace(`${location.origin}/api/orders`)).toBe(true);
    expect(shouldPropagateTrace("https://cdn.example.com/app.js")).toBe(false);
  });

  it("replaces the default rule when tracePropagationTargets is set", () => {
    sentry.setOptions({
      ...DEFAULT_OPTIONS,
      tracePropagationTargets: ["cdn.example", /^https:\/\/api\./],
    });
    expect(shouldPropagateTrace("https://cdn.example.com/app.js")).toBe(true);
    expect(shouldPropagateTrace("https://api.example.com/v1/orders")).toBe(
      true,
    );
    expect(shouldPropagateTrace("/api/orders")).toBe(false);
  });
});

describe("page view trace rotation", () => {
  afterEach(() => {
    resetPageView();
  });

  it("starts a new trace per page view and keeps it stable within one", () => {
    initPageView();
    const first = getBaseData().traceId;
    expect(getBaseData().traceId).toBe(first);

    recordRoutePageView(
      `${location.origin}/next`,
      location.href,
      "HistoryChange",
    );
    const second = getBaseData().traceId;
    expect(second).not.toBe(first);
    expect(getBaseData().traceId).toBe(second);
  });
});

describe("fetch trace propagation", () => {
  let fetchMock: FetchMock;

  afterEach(() => {
    destroy();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    sentry.setOptions({
      ...DEFAULT_OPTIONS,
      tracePropagationTargets: undefined,
    });
  });

  function stubFetch(status = 200): void {
    fetchMock = vi.fn<
      [input: RequestInfo | URL, init?: RequestInit | undefined],
      Promise<Response>
    >(() => Promise.resolve(new Response(null, { status })));
    vi.stubGlobal("fetch", fetchMock);
  }

  function lastFetchInit(): RequestInit | undefined {
    const call = fetchMock.mock.calls.at(-1);
    return call?.[1];
  }

  function traceparentOf(init: RequestInit | undefined): string | null {
    if (!init?.headers) return null;
    return new Headers(init.headers).get(TRACEPARENT_HEADER);
  }

  it("injects traceparent into same-origin requests", async () => {
    stubFetch();
    initForHttp();
    const { traceId } = getTraceContext();

    await globalThis.fetch("/api/orders");

    const header = traceparentOf(lastFetchInit());
    expect(header).toMatch(TRACEPARENT_VALUE_PATTERN);
    expect(parseTraceparent(header ?? undefined)?.traceId).toBe(traceId);
  });

  it("keeps traceparent off cross-origin requests by default", async () => {
    stubFetch();
    initForHttp();

    await globalThis.fetch("https://cdn.example.com/app.js");

    expect(traceparentOf(lastFetchInit())).toBeNull();
  });

  it("honors tracePropagationTargets for cross-origin requests", async () => {
    stubFetch();
    initForHttp({ tracePropagationTargets: ["api.partner.com"] });

    await globalThis.fetch("https://api.partner.com/v1/orders");
    expect(traceparentOf(lastFetchInit())).toMatch(TRACEPARENT_VALUE_PATTERN);

    await globalThis.fetch("https://other.example.com/v1/orders");
    expect(traceparentOf(lastFetchInit())).toBeNull();
  });

  it("merges Request and init headers without dropping either", async () => {
    stubFetch();
    initForHttp();

    await globalThis.fetch(
      new Request(`${location.origin}/api/orders`, {
        method: "PUT",
        headers: { "x-from-request": "1" },
      }),
      { headers: { "x-from-init": "2" } },
    );

    const headers = new Headers(lastFetchInit()?.headers);
    expect(headers.get("x-from-request")).toBe("1");
    expect(headers.get("x-from-init")).toBe("2");
    expect(headers.get(TRACEPARENT_HEADER)).toMatch(TRACEPARENT_VALUE_PATTERN);
  });

  it("reports http events with the propagated span id", async () => {
    vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    stubFetch(500);
    initForHttp({ cacheMaxLength: 1 });

    await globalThis.fetch("/api/broken");
    await vi.waitFor(() => {
      expect(navigator.sendBeacon).toHaveBeenCalled();
    });

    const beacon = vi.mocked(navigator.sendBeacon);
    const payload = findPayload(
      beacon.mock.calls.flatMap(getPayloads),
      "Fetch",
    );
    const header = traceparentOf(lastFetchInit());
    const parsed = parseTraceparent(header ?? undefined);
    expect(payload).toMatchObject({
      type: "fetch",
      api: "/api/broken",
      traceId: parsed?.traceId,
      spanId: parsed?.spanId,
    });
  });
});

describe("xhr trace propagation", () => {
  afterEach(() => {
    destroy();
    vi.restoreAllMocks();
    sentry.setOptions({
      ...DEFAULT_OPTIONS,
      tracePropagationTargets: undefined,
    });
  });

  function createOpenedXhr(url: string): XMLHttpRequest {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    return xhr;
  }

  it("injects traceparent before sending same-origin requests", () => {
    vi.spyOn(XMLHttpRequest.prototype, "send").mockImplementation(() => {});
    initForHttp({ enableXhr: true });
    const { traceId } = getTraceContext();

    const xhr = createOpenedXhr("/api/orders");
    const setHeader = vi.spyOn(xhr, "setRequestHeader");
    xhr.send();

    expect(setHeader).toHaveBeenCalledTimes(1);
    expect(setHeader).toHaveBeenCalledWith(
      TRACEPARENT_HEADER,
      expect.stringMatching(TRACEPARENT_VALUE_PATTERN),
    );
    const value = String(setHeader.mock.calls[0]?.[1]);
    expect(parseTraceparent(value)?.traceId).toBe(traceId);
  });

  it("keeps traceparent off cross-origin requests by default", () => {
    vi.spyOn(XMLHttpRequest.prototype, "send").mockImplementation(() => {});
    initForHttp({ enableXhr: true });

    const xhr = createOpenedXhr("https://cdn.example.com/data.json");
    const setHeader = vi.spyOn(xhr, "setRequestHeader");
    xhr.send();

    expect(setHeader).not.toHaveBeenCalled();
  });
});

describe("report shell trace dimension", () => {
  afterEach(() => {
    destroy();
    vi.restoreAllMocks();
    sentry.setOptions({
      ...DEFAULT_OPTIONS,
      tracePropagationTargets: undefined,
    });
  });

  it("lifts the payload trace id onto the report shell", async () => {
    vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    const captured: IReportData[] = [];
    init({
      dsn: "/api/log",
      cacheMaxLength: 1,
      enableClick: false,
      enableFetch: false,
      enableHashChange: false,
      enableHistory: false,
      enableUnhandledRejection: false,
      enableWhiteScreen: false,
      enableXhr: false,
      beforeSend: (data) => {
        captured.push(data);
        return data;
      },
    });
    captured.length = 0;

    traceError(new Error("trace-shell-boom"));
    await flush();

    expect(captured).toHaveLength(1);
    const report = captured[0];
    expect(report.traceId).toMatch(/^[0-9a-f]{32}$/);
    expect(report.traceId).toBe(report.payload.traceId);
    expect(reportDataListSchema.safeParse(captured).success).toBe(true);
  });
});
