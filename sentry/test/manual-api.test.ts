import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_OPTIONS } from "@/constants/index.js";
import {
  afterSend,
  beforeSend,
  beforeSendBatch,
  flushOfflineCache,
  getIdentity,
  setUserId,
  traceCustomEvent,
  tracePageView,
  tracePerformance,
} from "@/index.js";
import { EventType } from "@/types/index.js";
import { getBaseData, sentry } from "@/utils/index.js";

describe("manual public APIs", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    sentry.setOptions(DEFAULT_OPTIONS);
  });

  it("exposes current user id through identity", () => {
    setUserId("user-1");

    expect(getIdentity()).toMatchObject({ userId: "user-1" });
  });

  it("reports manual custom, page view, and performance events", async () => {
    const sendBeacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    sentry.setOptions({
      ...DEFAULT_OPTIONS,
      dsn: "/api/log",
      cacheMaxLength: 1,
    });

    traceCustomEvent({ name: "custom", message: "custom message" });
    tracePageView({ name: "pv", message: "/home" });
    tracePerformance({ name: "api", message: "/api", value: 100 });

    expect(sendBeacon).toHaveBeenCalledTimes(3);
  });

  it("registers runtime report hooks", async () => {
    const afterSendHook = vi.fn();
    const sendBeacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    sentry.setOptions({
      ...DEFAULT_OPTIONS,
      dsn: "/api/log",
      cacheMaxLength: 1,
    });

    beforeSend((data) => ({ ...data, name: "renamed" }));
    beforeSendBatch((events) => events.slice(0, 1));
    afterSend(afterSendHook);
    traceCustomEvent({ name: "custom", message: "custom message" });

    expect(sendBeacon.mock.calls[0]?.[1]).toContain("renamed");
    expect(afterSendHook).toHaveBeenCalledTimes(1);
  });

  it("flushes stored offline reports through flushOfflineCache", async () => {
    const sendBeacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    sentry.setOptions({ ...DEFAULT_OPTIONS, dsn: "/api/log" });
    const payload = {
      ...getBaseData(),
      type: EventType.Custom,
      name: "offline",
      message: "offline",
    };
    localStorage.setItem(
      DEFAULT_OPTIONS.offlineCacheKey,
      JSON.stringify([
        {
          ...payload,
          url: location.href,
          userId: "unknown",
          anonymousId: "unknown",
          visitorId: "unknown",
          projectId: "unknown",
          sdkVersion: "1.0.2",
          deviceInfo: sentry.deviceInfo,
          payload,
        },
      ]),
    );

    await flushOfflineCache();

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(DEFAULT_OPTIONS.offlineCacheKey)).toBeNull();
  });
});
