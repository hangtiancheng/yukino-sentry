import type { TReportPayload } from "../types";
import { sentryLogger, sentry } from "../utils";

export function shouldQueuePayload(payload: TReportPayload): boolean {
  const options = sentry.options;
  if (options.dsn === "") {
    sentryLogger.error("DSN is empty, report cancelled", payload);
    return false;
  }
  if (Math.random() > options.tracesSampleRate) {
    sentryLogger.info(`Dropped by sample rate: ${payload.type}`);
    return false;
  }
  if (options.screenRecordEventTypes.includes(payload.type)) {
    sentry.shouldScreenRecord = true;
  }
  return true;
}
