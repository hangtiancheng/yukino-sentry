import {
  destroy,
  init,
  isInitialized,
  enablePlugin,
} from "./core/sdk-lifecycle.js";
import { setUserId, setVisitorId, getIdentity } from "./core/identity.js";
import {
  afterSend,
  beforeSend,
  beforeSendBatch,
  flushOfflineCache,
  traceCustomEvent,
  traceError,
  tracePageView,
  tracePerformance,
} from "./core/api.js";
export { reportFrameworkError } from "./core/framework-error.js";
export type { InitOptions } from "./core/options-schema.js";
export {
  init,
  destroy,
  isInitialized,
  enablePlugin,
  setUserId,
  setVisitorId,
  getIdentity,
  beforeSend,
  beforeSendBatch,
  afterSend,
  flushOfflineCache,
  traceError,
  tracePerformance,
  traceCustomEvent,
  tracePageView,
};

export * from "./types";
