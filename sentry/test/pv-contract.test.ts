import { afterEach, describe, expect, it, vi } from "vitest";

import { tracePageView } from "@/core/api.js";
import {
  flushCurrentPageDwell,
  initPageView,
  recordRoutePageView,
  resetPageView,
} from "@/core/pv-lifecycle.js";
import reporter from "@/reporter/index.js";
import { EventType } from "@/types/index.js";

vi.mock("../src/reporter/index.js", () => ({ default: { send: vi.fn() } }));

describe("page-view aggregation contract", () => {
  afterEach(() => {
    resetPageView();
    vi.useRealTimers();
  });

  it("counts two visits for A to B, ignoring duplicate routes and dwell flushes", () => {
    vi.useFakeTimers();
    const pageA = location.href;
    const pageB = new URL("/page-b", pageA).href;
    initPageView();
    vi.advanceTimersByTime(150);
    recordRoutePageView(pageB, pageA, "HistoryChange");
    recordRoutePageView(pageB, pageA, "HistoryChange");
    vi.advanceTimersByTime(200);
    flushCurrentPageDwell(true);
    const payloads = vi
      .mocked(reporter.send)
      .mock.calls.map(([payload]) => payload);
    expect(
      payloads.map((payload) => [payload.type, payload.pageViewKind]),
    ).toEqual([
      [EventType.PV, "visit"],
      [EventType.PV, "dwell"],
      [EventType.PV, "visit"],
      [EventType.PV, "dwell"],
    ]);
    expect(
      payloads.filter((payload) => payload.pageViewKind === "visit"),
    ).toHaveLength(2);
  });

  it("counts every manual call as a visit without replacing automatic route state", () => {
    vi.useFakeTimers();
    initPageView();
    tracePageView({ name: "PageDwell" });
    tracePageView();
    vi.advanceTimersByTime(150);
    recordRoutePageView(location.href, location.href, "HistoryChange");
    flushCurrentPageDwell(true);
    const payloads = vi
      .mocked(reporter.send)
      .mock.calls.map(([payload]) => payload);
    expect(payloads.map((payload) => payload.pageViewKind)).toEqual([
      "visit",
      "visit",
      "visit",
      "dwell",
    ]);
    expect(payloads[3]?.message).toBe(location.href);
  });
});
