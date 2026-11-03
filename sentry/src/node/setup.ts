import { EventType } from "../types";
import { getBaseData, sentry, sentryLogger } from "../utils";
import type { Cleanup } from "../utils/decorate-prop.js";
import { clearSubscriptions, pub, sub } from "../core/bus.js";
import { pubFetch } from "../core/decorate-http.js";
import { handleError } from "../core/handle-error.js";
import { handleHttp } from "../core/handle-http.js";
import { handleUnhandledRejection } from "../core/handle-events.js";
import reporter from "../reporter/index.js";

export type UnhandledRejectionMode = "strict" | "warn" | "none";

export interface NodeCaptureOptions {
  exitOnUncaughtException?: boolean | undefined;
  unhandledRejectionMode?: UnhandledRejectionMode | undefined;
}

const CRASH_FLUSH_TIMEOUT_MS = 2000;

async function flushBeforeCrash(): Promise<void> {
  let timeoutID: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      reporter.flush(),
      new Promise<void>((resolve) => {
        timeoutID = setTimeout(resolve, CRASH_FLUSH_TIMEOUT_MS);
      }),
    ]);
  } catch (err) {
    sentryLogger.error("Failed to flush reports before shutdown", err);
  } finally {
    if (timeoutID) clearTimeout(timeoutID);
  }
}

function setup(options: NodeCaptureOptions = {}): Cleanup {
  const exitOnUncaughtException = options.exitOnUncaughtException ?? true;
  const unhandledRejectionMode = options.unhandledRejectionMode ?? "strict";
  let active = true;
  let isCrashing = false;

  function shutdown(error: unknown): void {
    if (isCrashing) return;
    isCrashing = true;
    void flushBeforeCrash().finally(() => {
      if (!active) return;
      console.error(
        "[@yukino.js/sentry/node] Uncaught exception, shutting down:",
        error,
      );
      process.exit(1);
    });
  }

  function onUncaughtException(error: unknown): void {
    if (isCrashing) return;
    pub(EventType.Error, {
      ...getBaseData(),
      type: EventType.Error,
      extra: error,
    });
    if (exitOnUncaughtException) shutdown(error);
    else void flushBeforeCrash();
  }

  function onUnhandledRejection(reason: unknown): void {
    if (isCrashing) return;
    pub(EventType.UnhandledRejection, {
      ...getBaseData(),
      type: EventType.UnhandledRejection,
      extra: reason,
    });
    if (unhandledRejectionMode === "warn") {
      console.warn(
        "[@yukino.js/sentry/node] Unhandled promise rejection:",
        reason,
      );
    } else if (unhandledRejectionMode === "strict") {
      shutdown(reason);
    }
  }

  sentryLogger.info("Initializing Node.js SDK event subscriptions...");

  const cleanups: Cleanup[] = [];

  if (sentry.options.enableError) {
    cleanups.push(sub(EventType.Error, handleError));
    process.on("uncaughtException", onUncaughtException);
    cleanups.push(() => {
      process.off("uncaughtException", onUncaughtException);
    });
  }
  if (sentry.options.enableUnhandledRejection) {
    cleanups.push(sub(EventType.UnhandledRejection, handleUnhandledRejection));
    process.on("unhandledRejection", onUnhandledRejection);
    cleanups.push(() => {
      process.off("unhandledRejection", onUnhandledRejection);
    });
  }
  if (sentry.options.enableFetch) {
    cleanups.push(sub(EventType.Fetch, handleHttp));
    cleanups.push(pubFetch());
  }

  sentryLogger.success("Node.js SDK setup completed", {
    uncaughtException: sentry.options.enableError,
    unhandledRejection: sentry.options.enableUnhandledRejection,
    fetch: sentry.options.enableFetch,
  });

  return () => {
    active = false;
    cleanups.reverse().forEach((cleanup) => {
      cleanup();
    });
    clearSubscriptions();
  };
}

export default setup;
