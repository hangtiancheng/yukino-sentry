import { afterEach, describe, expect, it, vi } from "vitest";

import { destroy, init, traceError } from "@/index.js";

const captureDisabled = {
  enableClick: false,
  enableError: false,
  enableFetch: false,
  enableHashChange: false,
  enableHistory: false,
  enableUnhandledRejection: false,
  enableWhiteScreen: false,
  enableXhr: false,
} as const;

describe("lifecycle", () => {
  afterEach(() => {
    destroy();
    vi.restoreAllMocks();
  });

  it("respects capture switches during setup", () => {
    const addEventListener = vi.spyOn(document, "addEventListener");

    init({ dsn: "/api/log", ...captureDisabled });

    expect(addEventListener).not.toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
  });

  it("restores fetch after destroy", () => {
    const originalFetch = globalThis.fetch;

    init({
      dsn: "/api/log",
      enableClick: false,
      enableError: false,
      enableHashChange: false,
      enableHistory: false,
      enableUnhandledRejection: false,
      enableWhiteScreen: false,
      enableXhr: false,
    });
    expect(globalThis.fetch).not.toBe(originalFetch);

    destroy();

    expect(globalThis.fetch).toBe(originalFetch);
  });

  it("clears error deduplication state on destroy", async () => {
    const sendBeacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    init({ dsn: "/api/log", cacheMaxLength: 1, ...captureDisabled });

    traceError(new Error("boom"));
    await Promise.resolve();
    const reportsAfterFirst = sendBeacon.mock.calls.length;

    traceError(new Error("boom"));
    await Promise.resolve();
    expect(sendBeacon.mock.calls.length).toBe(reportsAfterFirst);

    destroy();
    init({ dsn: "/api/log", cacheMaxLength: 1, ...captureDisabled });

    traceError(new Error("boom"));
    await vi.waitFor(() => {
      expect(sendBeacon.mock.calls.length).toBeGreaterThan(reportsAfterFirst);
    });
  });
});
