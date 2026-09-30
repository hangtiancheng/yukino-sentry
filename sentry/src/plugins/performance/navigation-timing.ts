import { EventType, Status, type IPerformanceData } from "../../types";
import { getBaseData } from "../../utils";

interface NavigationTimingValues {
  readonly paintTime: number;
  readonly domInteractive: number;
  readonly domContentLoaded: number;
  readonly loadEvent: number;
  readonly firstByte: number;
  readonly dnsLookup: number;
  readonly tcpConnection: number;
  readonly tlsHandshake: number;
  readonly timeToFirstByte: number;
  readonly contentTransfer: number;
  readonly domProcessing: number;
  readonly resourceLoad: number;
  readonly redirect: number;
  readonly unloadTime: number;
  readonly triggerPageUrl: string;
}

function getPaintTime(): number {
  return (
    globalThis.performance.getEntriesByType("paint").at(-1)?.startTime ?? 0
  );
}

function isNavigationTiming(
  entry: PerformanceEntry,
): entry is PerformanceNavigationTiming {
  return entry.entryType === "navigation" && "fetchStart" in entry;
}

function getNavigationEntry(): PerformanceNavigationTiming | null {
  const entry = globalThis.performance.getEntriesByType("navigation")[0];
  return entry && isNavigationTiming(entry) ? entry : null;
}

function getSafeDuration(end: number, start: number): number {
  return Math.max(0, Math.round(end - start));
}

function getNavigationValues(
  timing: PerformanceNavigationTiming,
  paintTime: number,
): NavigationTimingValues {
  const fetchStart = timing.fetchStart;
  return {
    paintTime: paintTime > 0 ? getSafeDuration(paintTime, fetchStart) : 0,
    domInteractive: getSafeDuration(timing.domInteractive, fetchStart),
    domContentLoaded: getSafeDuration(
      timing.domContentLoadedEventEnd,
      fetchStart,
    ),
    loadEvent: getSafeDuration(timing.loadEventStart, fetchStart),
    firstByte: getSafeDuration(timing.responseStart, fetchStart),
    dnsLookup: getSafeDuration(
      timing.domainLookupEnd,
      timing.domainLookupStart,
    ),
    tcpConnection: getSafeDuration(timing.connectEnd, timing.connectStart),
    tlsHandshake: getSafeDuration(
      timing.connectEnd,
      timing.secureConnectionStart,
    ),
    timeToFirstByte: getSafeDuration(timing.responseStart, timing.requestStart),
    contentTransfer: getSafeDuration(timing.responseEnd, timing.responseStart),
    domProcessing: getSafeDuration(timing.domInteractive, timing.responseEnd),
    resourceLoad: getSafeDuration(
      timing.loadEventStart,
      timing.domContentLoadedEventEnd,
    ),
    redirect: getSafeDuration(timing.redirectEnd, timing.redirectStart),
    unloadTime: getSafeDuration(timing.unloadEventEnd, timing.unloadEventStart),
    triggerPageUrl: location.href,
  };
}

export function getNavigationTimingData(): IPerformanceData | null {
  if (
    !("performance" in globalThis) ||
    typeof globalThis.performance.getEntriesByType !== "function"
  ) {
    return null;
  }
  const timing = getNavigationEntry();
  if (!timing) {
    return null;
  }
  return {
    ...getBaseData(),
    type: EventType.Performance,
    name: "NavigationTiming",
    message: "Page navigation timing",
    status: Status.OK,
    extra: getNavigationValues(timing, getPaintTime()),
  };
}
