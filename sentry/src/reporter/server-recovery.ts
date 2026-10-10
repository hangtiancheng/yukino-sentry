import { sentryLogger, sentry } from "../utils";
import { unrefTimer } from "./timer.js";

interface ServerRecoveryCallbacks {
  readonly setOnline: (online: boolean) => void;
  readonly setRetryTimer: (timer: ReturnType<typeof setTimeout>) => void;
  readonly flush: () => Promise<void>;
}

const BASE_RETRY_MS = 1000;

let nextRetryDelayMs = BASE_RETRY_MS;

export function resetServerRecovery(): void {
  nextRetryDelayMs = BASE_RETRY_MS;
}

export function scheduleServerRecovery(
  retryTimer: ReturnType<typeof setTimeout> | undefined,
  callbacks: ServerRecoveryCallbacks,
): ReturnType<typeof setTimeout> {
  callbacks.setOnline(false);
  if (retryTimer) clearTimeout(retryTimer);
  const nextRetryTimer = setTimeout(
    () => {
      testServerAvailable(callbacks);
    },
    Math.min(nextRetryDelayMs, sentry.options.retryIntervalMilliseconds),
  );
  unrefTimer(nextRetryTimer);
  callbacks.setRetryTimer(nextRetryTimer);
  return nextRetryTimer;
}

function testServerAvailable(callbacks: ServerRecoveryCallbacks): void {
  fetch(sentry.options.dsn, { method: "HEAD" })
    .then((res) => {
      if (!res.ok) {
        escalateRetryDelay();
        scheduleServerRecovery(undefined, callbacks);
        return;
      }
      resetServerRecovery();
      callbacks.setOnline(true);
      sentryLogger.info("Server is back available, flushing cache");
      void callbacks.flush();
    })
    .catch(() => {
      escalateRetryDelay();
      scheduleServerRecovery(undefined, callbacks);
    });
}

function escalateRetryDelay(): void {
  nextRetryDelayMs = Math.min(
    nextRetryDelayMs * 2,
    sentry.options.retryIntervalMilliseconds,
  );
}
