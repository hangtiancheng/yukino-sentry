// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import * as nodeSdk from "@/node/index.js";
import {
  continueTrace,
  getActiveTraceContext,
  getTraceparent,
} from "@/node/trace.js";
import { parseTraceparent } from "@/core/trace.js";
import { TRACEPARENT_HEADER } from "@/constants/index.js";
import { getBaseData } from "@/utils/index.js";

const DSN = "http://127.0.0.1:65535/api/log";
const INCOMING_TRACE_ID = "0af7651916cd43dd8448eb211c80319c";
const INCOMING_SPAN_ID = "b7ad6b7169203331";
const INCOMING_TRACEPARENT = `00-${INCOMING_TRACE_ID}-${INCOMING_SPAN_ID}-01`;

type FetchMock = Mock<
  [input: RequestInfo | URL, init?: RequestInit | undefined],
  Promise<Response>
>;

interface ReportRecord {
  traceId: string;
  payload: {
    type: string;
    message: string;
    traceId: string;
    spanId?: string;
    api?: string;
  };
}

describe("continueTrace context", () => {
  it("inherits the trace id and issues a fresh span", () => {
    continueTrace(INCOMING_TRACEPARENT, (context) => {
      expect(context.traceId).toBe(INCOMING_TRACE_ID);
      expect(context.spanId).toMatch(/^[0-9a-f]{16}$/);
      expect(context.spanId).not.toBe(INCOMING_SPAN_ID);
      expect(getActiveTraceContext()).toEqual(context);
      expect(getTraceparent()).toBe(
        `00-${context.traceId}-${context.spanId}-01`,
      );
    });
    expect(getActiveTraceContext()).toBeUndefined();
    expect(getTraceparent()).toBeUndefined();
  });

  it("starts a fresh trace for missing or malformed headers", () => {
    for (const source of [null, undefined, "garbage"]) {
      continueTrace(source, (context) => {
        expect(context.traceId).toMatch(/^[0-9a-f]{32}$/);
        expect(context.traceId).not.toBe(INCOMING_TRACE_ID);
      });
    }
  });

  it("accepts node-style array header values", () => {
    continueTrace([INCOMING_TRACEPARENT], (context) => {
      expect(context.traceId).toBe(INCOMING_TRACE_ID);
    });
  });

  it("survives await boundaries inside the callback", async () => {
    await continueTrace(INCOMING_TRACEPARENT, async () => {
      await Promise.resolve();
      expect(getActiveTraceContext()?.traceId).toBe(INCOMING_TRACE_ID);
    });
  });
});

describe("node trace reporting", () => {
  let fetchMock: FetchMock;
  let fetchCalls: [RequestInfo | URL, (RequestInit | undefined)?][];

  function okResponse(): Response {
    return new Response(null, { status: 200 });
  }

  function firstReportBody(): ReportRecord[] {
    const call = fetchCalls.find(([url]) => url === DSN);
    const body = call?.[1]?.body;
    return JSON.parse(typeof body === "string" ? body : "[]");
  }

  beforeEach(() => {
    fetchCalls = [];
    fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      fetchCalls.push([input, init]);
      return Promise.resolve(okResponse());
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    nodeSdk.destroy();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reports events with the inherited trace id inside continueTrace", async () => {
    nodeSdk.init({ dsn: DSN });

    await continueTrace(INCOMING_TRACEPARENT, async () => {
      expect(getBaseData().traceId).toBe(INCOMING_TRACE_ID);
      nodeSdk.traceError(new Error("in-trace-boom"));
      await nodeSdk.flush();
    });

    const body = firstReportBody();
    expect(body).toHaveLength(1);
    expect(body[0]?.traceId).toBe(INCOMING_TRACE_ID);
    expect(body[0]?.payload.traceId).toBe(INCOMING_TRACE_ID);
  });

  it("gives standalone events fresh trace ids", async () => {
    nodeSdk.init({ dsn: DSN });

    nodeSdk.traceError(new Error("standalone-1"));
    nodeSdk.traceError(new Error("standalone-2"));
    await nodeSdk.flush();

    const body = firstReportBody();
    expect(body).toHaveLength(2);
    expect(body[0]?.traceId).toMatch(/^[0-9a-f]{32}$/);
    expect(body[0]?.traceId).not.toBe(body[1]?.traceId);
  });

  it("propagates traceparent on outbound fetch inside continueTrace", async () => {
    nodeSdk.init({ dsn: DSN });

    await continueTrace(INCOMING_TRACEPARENT, async () => {
      await fetch("http://127.0.0.1:65535/downstream");
    });

    const downstream = fetchCalls.find(([url]) =>
      String(url).endsWith("/downstream"),
    );
    expect(downstream).toBeDefined();
    const headers = new Headers(downstream?.[1]?.headers);
    const parsed = parseTraceparent(
      headers.get(TRACEPARENT_HEADER) ?? undefined,
    );
    expect(parsed?.traceId).toBe(INCOMING_TRACE_ID);
    expect(parsed?.spanId).not.toBe(INCOMING_SPAN_ID);
  });

  it("propagates to every outbound request by default on node", async () => {
    nodeSdk.init({ dsn: DSN });

    await fetch("https://partner.example.com/api");

    const partner = fetchCalls.find(([url]) =>
      String(url).includes("partner.example.com"),
    );
    expect(partner).toBeDefined();
    const headers = new Headers(partner?.[1]?.headers);
    expect(headers.get(TRACEPARENT_HEADER)).toMatch(
      /^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/,
    );
  });

  it("restricts propagation when tracePropagationTargets is set", async () => {
    nodeSdk.init({
      dsn: DSN,
      tracePropagationTargets: ["allowed.example.com"],
    });

    await fetch("https://allowed.example.com/api");
    await fetch("https://blocked.example.com/api");

    const allowed = fetchCalls.find(([url]) =>
      String(url).includes("allowed.example.com"),
    );
    const blocked = fetchCalls.find(([url]) =>
      String(url).includes("blocked.example.com"),
    );
    const allowedHeaders = new Headers(allowed?.[1]?.headers);
    const blockedHeaders = new Headers(blocked?.[1]?.headers);
    expect(allowedHeaders.get(TRACEPARENT_HEADER)).not.toBeNull();
    expect(blockedHeaders.get(TRACEPARENT_HEADER)).toBeNull();
  });

  it("falls back to the ambient trace after destroy", () => {
    nodeSdk.init({ dsn: DSN });
    expect(getBaseData().traceId).not.toBe(getBaseData().traceId);

    nodeSdk.destroy();
    expect(getBaseData().traceId).toBe(getBaseData().traceId);
  });
});
