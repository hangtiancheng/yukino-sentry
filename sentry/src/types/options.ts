import type { IBreadcrumbItem, IReportData } from "./common.js";

import type { EventType } from "./enums.js";

export type BeforeSendHook = (
  data: IReportData,
) => Promise<IReportData | false> | IReportData | false;

export type BeforeSendBatchHook = (
  data: readonly IReportData[],
) => Promise<readonly IReportData[] | false> | readonly IReportData[] | false;

export type AfterSendHook = (
  data: readonly IReportData[],
) => Promise<void> | void;

export type BeforeBreadcrumbHook = (data: IBreadcrumbItem) => IBreadcrumbItem;

export interface IOptions {
  // Report endpoint.
  dsn: string;
  // Frontend project id.
  projectId: string;
  // Disable the SDK.
  disabled: boolean;
  // User id.
  userId: string;
  // Capture XMLHttpRequest requests.
  enableXhr: boolean;
  // Capture fetch requests.
  enableFetch: boolean;
  // Capture click events.
  enableClick: boolean;
  // Capture error events.
  enableError: boolean;
  // Capture unhandledrejection events.
  enableUnhandledRejection: boolean;
  // Capture hashchange navigation.
  enableHashChange: boolean;
  // Capture history navigation.
  enableHistory: boolean;
  // Enable white screen detection.
  enableWhiteScreen: boolean;
  // Enable FingerprintJS visitor identity.
  enableFingerprint: boolean;
  // SDK-generated anonymous visitor id.
  anonymousId: string;
  // Backend-bound visitor id.
  visitorId: string;
  // Screen record window duration.
  screenRecordDurationMs: number;
  screenRecordEventTypes: EventType[];
  // Page has a skeleton screen during white screen detection.
  hasSkeleton: boolean;
  rootCssSelectors: string[];
  // Click capture throttle delay.
  clickThrottleDelay: number;
  // Breadcrumb capacity.
  maxBreadcrumbs: number;
  // Report duplicate code errors.
  repeatCodeError: boolean;
  // Report successful HTTP requests as performance events.
  enableHttpPerformance: boolean;
  // Ignored errors.
  ignoreErrors: (string | RegExp)[];
  // Excluded APIs.
  excludeAPIs: (string | RegExp)[];
  // Hook before storing a breadcrumb.
  beforeBreadcrumb?: BeforeBreadcrumbHook | undefined;
  // Offline cache maximum length.
  cacheMaxLength: number;
  // Batch waiting time in milliseconds.
  cacheWaitingTime: number;
  // Maximum queued events while offline.
  maxQueueLength: number;
  // Server recovery probe interval.
  retryIntervalMilliseconds: number;
  // Hook before one event enters the report queue.
  beforeSend?: BeforeSendHook | undefined;
  // Hook before a batch enters transport.
  beforeSendBatch?: BeforeSendBatchHook | undefined;
  // Hook after a batch is sent successfully.
  afterSend?: AfterSendHook | undefined;
  // Offline cache localStorage key.
  offlineCacheKey: string;
  // Sampling rate between 0 and 1.
  tracesSampleRate: number;
  // Enable debug logging in the console.
  debug: boolean;
}
