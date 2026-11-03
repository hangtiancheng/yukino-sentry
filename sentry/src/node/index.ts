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
import { optionsSchema, type InitOptions } from "../core/options-schema.js";
import { createSdkLifecycle } from "../core/sdk-lifecycle.js";
import { z } from "zod";
import nodeSetup, {
  type NodeCaptureOptions,
  type UnhandledRejectionMode,
} from "./setup.js";

export { reportFrameworkError } from "../core/framework-error.js";
export type { InitOptions } from "../core/options-schema.js";
export type { UnhandledRejectionMode } from "./setup.js";

export interface NodeInitOptions extends InitOptions {
  exitOnUncaughtException?: boolean | undefined;
  unhandledRejectionMode?: UnhandledRejectionMode | undefined;
}

const nodeOptionsSchema = optionsSchema.partial().extend({
  dsn: z.string(),
  exitOnUncaughtException: z.boolean().optional(),
  unhandledRejectionMode: z.enum(["strict", "warn", "none"]).optional(),
});

let captureOptions: NodeCaptureOptions = {};
const nodeLifecycle = createSdkLifecycle({
  setup: () => nodeSetup(captureOptions),
});

function warnIfDsnIsNotAbsolute(dsn: string): void {
  try {
    void new URL(dsn);
  } catch {
    console.warn(
      `[@yukino.js/sentry/node] dsn "${dsn}" is not an absolute URL. Node.js cannot resolve relative endpoints; provide a full URL such as "https://example.com/api/log".`,
    );
  }
}

export function init(options: NodeInitOptions): void {
  if (nodeLifecycle.isInitialized()) return;
  const { exitOnUncaughtException, unhandledRejectionMode, ...coreOptions } =
    nodeOptionsSchema.parse(options);
  captureOptions = { exitOnUncaughtException, unhandledRejectionMode };
  nodeLifecycle.init(coreOptions);
  if (nodeLifecycle.isInitialized()) {
    warnIfDsnIsNotAbsolute(coreOptions.dsn);
  }
}

export function destroy(): void {
  nodeLifecycle.destroy();
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
