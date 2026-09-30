import type { IReportData } from "../types";
import { sentryLogger, sentry } from "../utils";
import { reportDataListSchema } from "./report-data-schema.js";

export function loadOfflineCache(): IReportData[] {
  try {
    const cache = localStorage.getItem(sentry.options.offlineCacheKey);
    if (!cache) return [];
    const parsed: unknown = JSON.parse(cache);
    const result = reportDataListSchema.safeParse(parsed);
    if (!result.success) return [];
    localStorage.removeItem(sentry.options.offlineCacheKey);
    return result.data.slice(-sentry.options.maxQueueLength);
  } catch {
    localStorage.removeItem(sentry.options.offlineCacheKey);
    return [];
  }
}

export function saveOfflineCache(events: readonly IReportData[]): void {
  try {
    localStorage.setItem(
      sentry.options.offlineCacheKey,
      JSON.stringify(events.slice(-sentry.options.maxQueueLength)),
    );
  } catch {
    sentryLogger.error("Failed to save offline cache");
  }
}

export function clearOfflineCache(): void {
  try {
    localStorage.removeItem(sentry.options.offlineCacheKey);
  } catch {
    sentryLogger.error("Failed to clear offline cache");
  }
}
