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
  dsn: string;
  projectId: string;
  disabled: boolean;
  userId: string;
  enableXhr: boolean;
  enableFetch: boolean;
  enableClick: boolean;
  enableError: boolean;
  enableUnhandledRejection: boolean;
  enableHashChange: boolean;
  enableHistory: boolean;
  enableWhiteScreen: boolean;
  enableFingerprint: boolean;
  anonymousId: string;
  visitorId: string;
  screenRecordDurationMs: number;
  screenRecordEventTypes: EventType[];
  hasSkeleton: boolean;
  rootCssSelectors: string[];
  clickThrottleDelay: number;
  maxBreadcrumbs: number;
  repeatCodeError: boolean;
  enableHttpPerformance: boolean;
  ignoreErrors: (string | RegExp)[];
  excludeAPIs: (string | RegExp)[];
  beforeBreadcrumb?: BeforeBreadcrumbHook | undefined;
  cacheMaxLength: number;
  cacheWaitingTime: number;
  maxQueueLength: number;
  retryIntervalMilliseconds: number;
  beforeSend?: BeforeSendHook | undefined;
  beforeSendBatch?: BeforeSendBatchHook | undefined;
  afterSend?: AfterSendHook | undefined;
  offlineCacheKey: string;
  tracesSampleRate: number;
  debug: boolean;
}
