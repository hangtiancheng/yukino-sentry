import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_OPTIONS } from "@/constants/index.js";
import { optionsSchema } from "@/core/options-schema.js";
import { DataReporter } from "@/reporter/index.js";
import { reportDataListSchema } from "@/reporter/report-data-schema.js";
import { runBeforeReportHook } from "@/reporter/report-data.js";
import { EventType, Status } from "@/types/index.js";
import { getBaseData, sentry } from "@/utils/index.js";

describe("per-event sampling", () => {
  let reporter: DataReporter | undefined;

  afterEach(() => {
    reporter?.dispose();
    reporter = undefined;
    localStorage.clear();
    sentry.setOptions(DEFAULT_OPTIONS);
    sentry.shouldScreenRecord = false;
    vi.restoreAllMocks();
  });

  async function send(type: EventType) {
    reporter ??= new DataReporter();
    await reporter.send(
      {
        ...getBaseData(),
        type,
        name: "sampling-test",
        message: "test",
        status: Status.OK,
        extra: {},
      },
      true,
    );
  }

  it.each(Object.values(EventType))(
    "independently admits and rejects %s",
    async (type) => {
      reporter = undefined;
      const beacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
      const random = vi.spyOn(Math, "random").mockReturnValue(0.2);
      sentry.setOptions({
        ...DEFAULT_OPTIONS,
        dsn: "/api/log",
        tracesSampleRate: 0,
        eventSampleRates: { [type]: 0.25 },
      });
      await send(type);
      expect(beacon).toHaveBeenCalledTimes(1);
      const body = beacon.mock.calls[0]?.[1];
      if (typeof body !== "string")
        throw new Error("Expected serialized events");
      const events = reportDataListSchema.parse(JSON.parse(body));
      expect(events[0]?.sampleRate).toBe(0.25);
      random.mockReturnValue(0.8);
      await send(type);
      expect(beacon).toHaveBeenCalledTimes(1);
    },
  );

  it.each(Object.values(EventType))(
    "retains the legacy fallback for %s",
    async (type) => {
      reporter = undefined;
      const beacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
      const random = vi.spyOn(Math, "random").mockReturnValue(0.8);
      sentry.setOptions({
        ...DEFAULT_OPTIONS,
        dsn: "/api/log",
        tracesSampleRate: 0.25,
      });
      await send(type);
      expect(beacon).not.toHaveBeenCalled();
      random.mockReturnValue(0.2);
      await send(type);
      expect(beacon).toHaveBeenCalledTimes(1);
    },
  );

  it("keeps PV at full collection while sampling performance and recording", async () => {
    reporter = undefined;
    const beacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    vi.spyOn(Math, "random").mockReturnValue(0.8);
    sentry.setOptions({
      ...DEFAULT_OPTIONS,
      dsn: "/api/log",
      tracesSampleRate: 0,
      eventSampleRates: {
        [EventType.PV]: 1,
        [EventType.Performance]: 0.1,
        [EventType.ScreenRecord]: 0.1,
      },
    });
    await send(EventType.PV);
    await send(EventType.Performance);
    await send(EventType.ScreenRecord);
    await send(EventType.Custom);
    expect(beacon).toHaveBeenCalledTimes(1);
  });

  it("never admits a zero-rate event even when the random value is zero", async () => {
    reporter = undefined;
    const beacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    vi.spyOn(Math, "random").mockReturnValue(0);
    sentry.setOptions({
      ...DEFAULT_OPTIONS,
      dsn: "/api/log",
      eventSampleRates: { [EventType.Error]: 0 },
    });
    await send(EventType.Error);
    expect(beacon).not.toHaveBeenCalled();
    expect(sentry.shouldScreenRecord).toBe(false);
  });

  it.each([-0.1, 1.1, NaN, Infinity])("rejects invalid rates (%s)", (rate) => {
    expect(
      optionsSchema.safeParse({
        ...DEFAULT_OPTIONS,
        eventSampleRates: { [EventType.PV]: rate },
      }).success,
    ).toBe(false);
  });

  it("rejects unknown event types", () => {
    expect(
      optionsSchema.safeParse({
        ...DEFAULT_OPTIONS,
        eventSampleRates: { typo: 1 },
      }).success,
    ).toBe(false);
  });

  it.each([true, false])(
    "restores offline events without resampling (metadata: %s)",
    async (withMetadata) => {
      sentry.setOptions({
        ...DEFAULT_OPTIONS,
        dsn: "/api/log",
        tracesSampleRate: 0.4,
      });
      const data = await runBeforeReportHook("offline-test", {
        ...getBaseData(),
        type: EventType.PV,
        pageViewKind: "visit",
        name: "PageLoad",
        message: location.href,
        status: Status.OK,
        extra: {},
      });
      if (!data) throw new Error("Expected a report");
      if (!withMetadata) {
        delete data.sampleRate;
        delete data.pageViewKind;
        delete data.payload.pageViewKind;
      }
      localStorage.setItem(
        DEFAULT_OPTIONS.offlineCacheKey,
        JSON.stringify([data]),
      );
      sentry.setOptions({ tracesSampleRate: 0 });
      const beacon = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
      reporter = new DataReporter();
      await reporter.flush();
      const body = beacon.mock.calls[0]?.[1];
      if (typeof body !== "string")
        throw new Error("Expected serialized events");
      const events = reportDataListSchema.parse(JSON.parse(body));
      expect(events).toHaveLength(1);
      expect(events[0]?.sampleRate).toBe(withMetadata ? 0.4 : undefined);
      expect(events[0]?.pageViewKind).toBe(withMetadata ? "visit" : undefined);
    },
  );
});
