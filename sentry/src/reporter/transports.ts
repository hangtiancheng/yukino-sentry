import { sentryLogger, sentry } from "../utils";

// Chromium rejects keepalive fetches (and sendBeacon payloads) over the
// ~64KB in-flight budget, so large batches (e.g. screen recordings) must
// fall back to a plain fetch or they would fail forever and stall the queue.
export const MAX_KEEPALIVE_BYTES = 60 * 1024;

export function getBodyByteLength(body: string): number {
  return new TextEncoder().encode(body).byteLength;
}

export function sendBeacon(body: string): boolean {
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    return navigator.sendBeacon(sentry.options.dsn, body);
  }
  return false;
}

export async function reportByFetch(
  body: string,
  keepalive: boolean,
  handleServerError: () => void,
): Promise<boolean> {
  try {
    const res = await fetch(sentry.options.dsn, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive,
    });
    if (!res.ok) handleServerError();
    return res.ok;
  } catch (err) {
    sentryLogger.error("Fetch report failed", err);
    handleServerError();
    return false;
  }
}
