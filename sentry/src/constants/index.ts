import { EventType, type IOptions } from "../types";

import packageJson from "../../package.json" with { type: "json" };

const { version: SDK_VERSION } = packageJson;

export { SDK_VERSION };

export const MAX_BREADCRUMBS = 30;

export const MAX_WHITE_SCREEN_SAMPLE_COUNT = 10;

export const WHITE_SCREEN_SAMPLE_INTERVAL = 1000;

export const UNKNOWN = "unknown";

export const DEFAULT_OPTIONS: IOptions = {
  dsn: "",
  projectId: UNKNOWN,
  userId: UNKNOWN,
  disabled: false,
  enableXhr: true,
  enableFetch: true,
  enableClick: true,
  enableError: true,
  enableUnhandledRejection: true,
  enableHashChange: true,
  enableHistory: true,
  enableWhiteScreen: true,
  enableFingerprint: false,
  anonymousId: UNKNOWN,
  visitorId: UNKNOWN,
  maxBreadcrumbs: MAX_BREADCRUMBS,
  screenRecordEventTypes: [
    EventType.Error,
    EventType.Xhr,
    EventType.Fetch,
    EventType.Resource,
    EventType.UnhandledRejection,
  ],
  hasSkeleton: false,
  rootCssSelectors: ["html", "body", "#app", "#root"],
  clickThrottleDelay: 0,
  screenRecordDurationMs: 3000,
  repeatCodeError: false,
  enableHttpPerformance: false,
  ignoreErrors: [],
  excludeAPIs: [],
  cacheMaxLength: 10,
  cacheWaitingTime: 2000,
  maxQueueLength: 200,
  retryIntervalMilliseconds: 60 * 1000,
  offlineCacheKey: "yukino_sentry_offline_cache",
  tracesSampleRate: 1,
  debug: false,
};
