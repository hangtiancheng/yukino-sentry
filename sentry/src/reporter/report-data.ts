import { SDK_VERSION } from "../constants";
import breadcrumb from "../core/breadcrumb.js";
import { EventType, type IReportData, type TReportPayload } from "../types";
import { sentry } from "../utils";
import { isPromise } from "./promise.js";

const BREADCRUMB_EVENT_TYPES = new Set<EventType>([
  EventType.Error,
  EventType.UnhandledRejection,
  EventType.Resource,
  EventType.Vue,
  EventType.React,
  EventType.OtherFrameworks,
]);

function payloadToReportData<T extends TReportPayload>(
  id: string,
  payload: T,
): IReportData<T> {
  const { type, name, time, timestamp, message, status } = payload;
  const data: IReportData<T> = {
    type,
    name,
    time,
    timestamp,
    message,
    status,
    id,
    url: location.href,
    userId: sentry.options.userId,
    anonymousId: sentry.options.anonymousId,
    visitorId: sentry.options.visitorId,
    projectId: sentry.options.projectId,
    sdkVersion: SDK_VERSION,
    deviceInfo: sentry.deviceInfo,
    payload,
  };
  if (BREADCRUMB_EVENT_TYPES.has(type)) {
    data.breadcrumbs = breadcrumb.dump();
  }
  return data;
}

export function runBeforeReportHook(
  id: string,
  payload: TReportPayload,
): IReportData | null | Promise<IReportData | null> {
  const data = payloadToReportData(id, payload);
  if (!sentry.options.beforeSend) return data;
  const hookResult = sentry.options.beforeSend(data);
  if (isPromise(hookResult)) {
    return hookResult.then(normalizeReportHookResult);
  }
  return normalizeReportHookResult(hookResult);
}

function normalizeReportHookResult(
  hookResult: IReportData | false,
): IReportData | null {
  return hookResult === false ? null : hookResult;
}

export function applyBeforePushHook(
  sendData: readonly IReportData[],
): IReportData[] | Promise<IReportData[]> {
  const hookResult = sentry.options.beforeSendBatch
    ? sentry.options.beforeSendBatch(sendData)
    : sendData;
  if (isPromise(hookResult)) {
    return hookResult.then(normalizeBatchHookResult);
  }
  return normalizeBatchHookResult(hookResult);
}

function normalizeBatchHookResult(
  hookResult: readonly IReportData[] | false,
): IReportData[] {
  return hookResult === false ? [] : [...hookResult];
}
