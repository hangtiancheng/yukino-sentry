import type { EventType, TReportPayload } from "../types";
import { sentryLogger, sentry } from "../utils";

export function getEventSampleRate(type: EventType): number {
  return (
    sentry.options.eventSampleRates[type] ?? sentry.options.tracesSampleRate
  );
}

export function shouldQueuePayload(payload: TReportPayload): boolean {
  const options = sentry.options;
  if (options.disabled) return false;
  if (options.dsn === "") {
    sentryLogger.error("DSN is empty, report cancelled", payload);
    return false;
  }
  const sampleRate = getEventSampleRate(payload.type);
  if (sampleRate === 0 || (sampleRate < 1 && Math.random() >= sampleRate)) {
    sentryLogger.info(`Dropped by sample rate: ${payload.type}`);
    return false;
  }
  if (options.screenRecordEventTypes.includes(payload.type)) {
    sentry.shouldScreenRecord = true;
  }
  return true;
}
