import { EventType } from "../types";
import { getBaseData, sentry, sentryLogger } from "../utils";
import type { Cleanup } from "../utils/decorate-prop.js";
import { clearSubscriptions, pub, sub } from "../core/bus.js";
import { pubFetch } from "../core/decorate-http.js";
import {
  handleError,
  handleHttp,
  handleUnhandledRejection,
} from "../core/handlers.js";
import reporter from "../reporter/index.js";

export type UnhandledRejectionMode = "strict" | "warn" | "none";

export interface NodeCaptureOptions {
  exitOnUncaughtException?: boolean | undefined;
  unhandledRejectionMode?: UnhandledRejectionMode | undefined;
}

interface ResolvedCaptureOptions {
  exitOnUncaughtException: boolean;
  unhandledRejectionMode: UnhandledRejectionMode;
}

const DEFAULT_CAPTURE_OPTIONS: ResolvedCaptureOptions = {
  exitOnUncaughtException: true,
  unhandledRejectionMode: "strict",
};

const CRASH_FLUSH_TIMEOUT_MS = 2000;

let captureOptions: ResolvedCaptureOptions = { ...DEFAULT_CAPTURE_OPTIONS };
let isCrashing = false;

export function setNodeCaptureOptions(options: NodeCaptureOptions): void {
  captureOptions = {
    exitOnUncaughtException:
      options.exitOnUncaughtException ??
      DEFAULT_CAPTURE_OPTIONS.exitOnUncaughtException,
    unhandledRejectionMode:
      options.unhandledRejectionMode ??
      DEFAULT_CAPTURE_OPTIONS.unhandledRejectionMode,
  };
}

export function resetNodeCaptureOptions(): void {
  captureOptions = { ...DEFAULT_CAPTURE_OPTIONS };
  isCrashing = false;
}

async function flushBeforeCrash(): Promise<void> {
  let timeoutID: ReturnType<typeof setTimeout> | undefined;
  try {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
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

function pubUncaughtException(): Cleanup {
  const listener = (error: Error): void => {
    if (isCrashing) return;
    isCrashing = true;
    pub(EventType.Error, {
      ...getBaseData(),
      type: EventType.Error,
      extra: error,
    });
    void flushBeforeCrash().finally(() => {
      if (captureOptions.exitOnUncaughtException) {
        console.error(
          "[@yukino.js/sentry/node] Uncaught exception, shutting down:",
          error,
        );
        process.exit(1);
      }
      isCrashing = false;
    });
  };
  process.on("uncaughtException", listener);
  return () => {
    process.off("uncaughtException", listener);
  };
}

function pubUnhandledRejection(): Cleanup {
  const listener = (reason: unknown): void => {
    pub(EventType.UnhandledRejection, {
      ...getBaseData(),
      type: EventType.UnhandledRejection,
      extra: reason,
    });
    const { unhandledRejectionMode } = captureOptions;
    if (unhandledRejectionMode === "none") return;
    if (unhandledRejectionMode === "warn") {
      console.warn(
        "[@yukino.js/sentry/node] Unhandled promise rejection:",
        reason,
      );
      return;
    }
    void flushBeforeCrash().finally(() => {
      setTimeout(() => {
        throw reason;
      }, 0);
    });
  };
  process.on("unhandledRejection", listener);
  return () => {
    process.off("unhandledRejection", listener);
  };
}

function setup(): Cleanup {
  sentryLogger.info("Initializing Node.js SDK event subscriptions...");

  const cleanups: Cleanup[] = [];

  if (sentry.options.enableError) {
    cleanups.push(sub(EventType.Error, handleError));
    cleanups.push(pubUncaughtException());
  }
  if (sentry.options.enableUnhandledRejection) {
    cleanups.push(sub(EventType.UnhandledRejection, handleUnhandledRejection));
    cleanups.push(pubUnhandledRejection());
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
    cleanups.toReversed().forEach((cleanup) => {
      cleanup();
    });
    clearSubscriptions();
    isCrashing = false;
  };
}

export default setup;
