import {
  afterSend,
  beforeSend,
  beforeSendBatch,
  flush,
  flushOfflineCache,
  traceCustomEvent,
  traceError,
  tracePerformance,
} from "../core/api.js";
import { getIdentity, setUserId, setVisitorId } from "../core/identity.js";
import type { InitOptions } from "../core/options-schema.js";
import { createSdkLifecycle } from "../core/sdk-lifecycle.js";
import { sentry } from "../utils";
import nodeSetup, {
  resetNodeCaptureOptions,
  setNodeCaptureOptions,
  type UnhandledRejectionMode,
} from "./setup.js";

export { reportFrameworkError } from "../core/framework-error.js";
export type { InitOptions } from "../core/options-schema.js";
export type { UnhandledRejectionMode } from "./setup.js";

export interface NodeInitOptions extends InitOptions {
  exitOnUncaughtException?: boolean | undefined;
  unhandledRejectionMode?: UnhandledRejectionMode | undefined;
}

const nodeLifecycle = createSdkLifecycle({ setup: nodeSetup });

function warnIfDsnIsNotAbsolute(): void {
  const { dsn } = sentry.options;
  try {
    void new URL(dsn);
  } catch {
    console.warn(
      `[@yukino.js/sentry/node] dsn "${dsn}" is not an absolute URL. Node.js cannot resolve relative endpoints; provide a full URL such as "https://example.com/api/log".`,
    );
  }
}

export function init(options: NodeInitOptions): void {
  const { exitOnUncaughtException, unhandledRejectionMode, ...coreOptions } =
    options;
  setNodeCaptureOptions({ exitOnUncaughtException, unhandledRejectionMode });
  nodeLifecycle.init(coreOptions);
  if (nodeLifecycle.isInitialized()) {
    warnIfDsnIsNotAbsolute();
  }
}

export function destroy(): void {
  nodeLifecycle.destroy();
  resetNodeCaptureOptions();
}

export const isInitialized = nodeLifecycle.isInitialized;

export const enablePlugin = nodeLifecycle.enablePlugin;

export {
  setUserId,
  setVisitorId,
  getIdentity,
  beforeSend,
  beforeSendBatch,
  afterSend,
  flush,
  flushOfflineCache,
  traceError,
  tracePerformance,
  traceCustomEvent,
};

export * from "../types";
