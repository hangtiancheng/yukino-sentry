import type { BreadcrumbType, EventType, Status } from "./enums.js";

import type { Metric } from "web-vitals";
import type { IOptions } from "./options.js";

export interface ISentry {
  codeErrors: { has(value: string): boolean; add(value: string): void };
  options: IOptions;
  shouldScreenRecord: boolean;
  deviceInfo: IDeviceInfo;
  setOptions: (newOptions: Partial<IOptions>) => void;
}

export interface IBreadcrumbItem extends IReportPayload {
  userAction: BreadcrumbType;
}

export interface IDeviceInfo {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  userAgent: string;
  deviceType: string;
  deviceModel: string;
  language: string;
  screenResolution: string;
}

export interface IReportPayload {
  id: string;
  deviceId?: string;
  sessionId?: string;
  type: EventType;
  name: string;
  time: string;
  timestamp: number;
  message: string;
  status: Status;
}

export interface IHttpData extends IReportPayload {
  method: string;
  api: string;
  elapsedTime: number;
  statusCode: number;
  requestData?: unknown;
  responseData?: unknown;
  serverTiming?: readonly string[];
}

export interface IResourceError extends IReportPayload {
  src: string;
  href: string;
}

interface IPerformanceMetricData extends IReportPayload {
  value: Metric["value"];
  rating?: Metric["rating"];
}

export interface IPerformanceResourceTiming {
  readonly name: string;
  readonly initiatorType: string;
  readonly startTime: number;
  readonly responseEnd: number;
  readonly duration: number;
  readonly transferSize: number;
  readonly encodedBodySize: number;
  readonly decodedBodySize: number;
  readonly fromCache: boolean;
}

interface IPerformanceResourceListData extends IReportPayload {
  resourceList: readonly IPerformanceResourceTiming[];
}
interface IPerformanceLongTaskData extends IReportPayload {
  longTasks: PerformanceEntry[];
}

interface IPerformanceMemoryData extends IReportPayload {
  memory: unknown;
}

interface IPerformanceExtraData extends IReportPayload {
  extra: unknown;
  value?: number;
}

export type IPerformanceData =
  | IPerformanceMetricData
  | IPerformanceResourceListData
  | IPerformanceLongTaskData
  | IPerformanceMemoryData
  | IPerformanceExtraData;

export interface ICodeError extends IReportPayload {
  line: number;
  column: number;
  extra?: string;
}

export interface IScreenRecordData extends IReportPayload {
  event: string;
  eventCount?: number;
}

export interface IExposureData extends IReportPayload {
  extra: {
    readonly threshold: number;
    readonly observeTime: number;
    readonly showTime: number;
    readonly showEndTime: number;
    readonly duration: number;
    readonly params: Readonly<Record<string, unknown>>;
  };
}

export interface IRouteData extends IReportPayload {
  from: string;
  to: string;
}

export type IBaseDataWithEvent = IReportPayload & {
  extra: unknown;
};

export type TReportPayload =
  | IBaseDataWithEvent
  | IHttpData
  | IResourceError
  | IPerformanceData
  | ICodeError
  | IExposureData
  | IScreenRecordData
  | IRouteData
  | IBatchErrorData;

export interface IBatchErrorData extends IReportPayload {
  batchError: true;
  batchErrorLength: number;
  batchErrorLastHappenTime: number;
}

export type TOnReportWhiteScreenData = (data: IBaseDataWithEvent) => void;

export type TOnReportPerformanceData = (data: IPerformanceData) => void;

export interface IReportData<
  T extends TReportPayload = TReportPayload,
> extends IReportPayload {
  url: string;
  userId: string;
  anonymousId: string;
  visitorId: string;
  projectId: string;
  sdkVersion: string;
  breadcrumbs?: IBreadcrumbItem[] | undefined;
  deviceInfo: IDeviceInfo;
  payload: T;
}

export interface IDataReporter {
  send(payload: TReportPayload, immediate?: boolean): Promise<void>;
  flushOfflineCache(): Promise<void>;
}

export interface IExtendedErrorEvent extends Event {
  target: EventTarget & {
    src?: string;
    href?: string;
    localName: string;
  };
}
