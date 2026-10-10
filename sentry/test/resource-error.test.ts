import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_OPTIONS } from "@/constants/index.js";
import { destroy, init } from "@/index.js";
import { EventType, Status } from "@/types/index.js";
import { isIExtendedErrorEvent, sentry } from "@/utils/index.js";
import { getPayloads, isRecord } from "./report-payloads.js";

function initForCapture(): ReturnType<
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  typeof vi.spyOn<Navigator, "sendBeacon">
> {
  const sendBeacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
  init({ dsn: "/api/log", cacheMaxLength: 1 });
  return sendBeacon;
}

async function flushReports(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
}

function findResourcePayload(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sendBeacon: ReturnType<typeof vi.spyOn<Navigator, "sendBeacon">>,
): Readonly<Record<string, unknown>> | null {
  const payloads = sendBeacon.mock.calls.flatMap(getPayloads);
  for (const payload of payloads) {
    if (isRecord(payload) && payload.type === EventType.Resource) {
      return payload;
    }
  }
  return null;
}

describe("resource load error classification", () => {
  afterEach(() => {
    destroy();
    vi.restoreAllMocks();
    sentry.setOptions(DEFAULT_OPTIONS);
    document.body.innerHTML = "";
  });

  it("reports a failed <img> (plain Event, src only) as EventType.Resource", async () => {
    const sendBeacon = initForCapture();

    const img = document.createElement("img");
    img.src = "https://example.com/missing-image.png";
    document.body.appendChild(img);
    img.dispatchEvent(new Event("error"));
    await flushReports();

    const payload = findResourcePayload(sendBeacon);
    expect(payload).not.toBeNull();
    expect(payload).toMatchObject({
      type: EventType.Resource,
      status: Status.Error,
      name: "img",
      src: "https://example.com/missing-image.png",
      href: "",
    });
    expect(payload?.message).toContain("https://example.com/missing-image.png");
  });

  it("reports a failed <link> (href only, no src) as EventType.Resource", async () => {
    const sendBeacon = initForCapture();

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://example.com/missing-styles.css";
    document.head.appendChild(link);
    link.dispatchEvent(new Event("error"));
    await flushReports();

    const payload = findResourcePayload(sendBeacon);
    expect(payload).not.toBeNull();
    expect(payload).toMatchObject({
      type: EventType.Resource,
      name: "link",
      src: "",
      href: "https://example.com/missing-styles.css",
    });

    link.remove();
  });

  it("does not report duplicate resource errors for the same src", async () => {
    const sendBeacon = initForCapture();

    const img = document.createElement("img");
    img.src = "https://example.com/dedup-image.png";
    document.body.appendChild(img);
    img.dispatchEvent(new Event("error"));
    img.dispatchEvent(new Event("error"));
    await flushReports();

    const payloads = sendBeacon.mock.calls
      .flatMap(getPayloads)
      .filter(
        (payload) => isRecord(payload) && payload.type === EventType.Resource,
      );
    expect(payloads).toHaveLength(1);
  });
});

describe("isIExtendedErrorEvent predicate", () => {
  it("matches a plain error Event on an element with src", () => {
    const img = document.createElement("img");
    img.src = "https://example.com/x.png";
    let matched = false;
    img.addEventListener("error", (event) => {
      matched = isIExtendedErrorEvent(event);
    });
    img.dispatchEvent(new Event("error"));
    expect(matched).toBe(true);
  });

  it("rejects an element error Event without src and href", () => {
    const img = document.createElement("img");
    let matched = true;
    img.addEventListener("error", (event) => {
      matched = isIExtendedErrorEvent(event);
    });
    img.dispatchEvent(new Event("error"));
    expect(matched).toBe(false);
  });

  it("rejects non-error events even on resource elements", () => {
    const img = document.createElement("img");
    img.src = "https://example.com/x.png";
    let matched = true;
    img.addEventListener("load", (event) => {
      matched = isIExtendedErrorEvent(event);
    });
    img.dispatchEvent(new Event("load"));
    expect(matched).toBe(false);
  });

  it("rejects code-error ErrorEvents targeting window and non-event values", () => {
    const errorEvent = new ErrorEvent("error", { message: "boom" });
    expect(isIExtendedErrorEvent(errorEvent)).toBe(false);
    expect(isIExtendedErrorEvent(new Error("boom"))).toBe(false);
    expect(isIExtendedErrorEvent(null)).toBe(false);
    expect(isIExtendedErrorEvent("error string")).toBe(false);
  });
});
