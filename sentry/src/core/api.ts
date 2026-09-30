import { Status, EventType } from "../types/index.js";
import type {
  AfterSendHook,
  BeforeSendBatchHook,
  BeforeSendHook,
} from "../types/index.js";
import { getBaseData, sentry } from "../utils/index.js";
import { handleError } from "./handlers.js";
import reporter from "../reporter/index.js";

export function traceError(error: unknown): void {
  handleError({
    ...getBaseData(),
    type: EventType.Error,
    status: Status.Error,
    extra: error,
  });
}

export function tracePerformance(input: {
  readonly name: string;
  readonly message: string;
  readonly value: number;
}): void {
  reporter.send({
    ...getBaseData(),
    type: EventType.Performance,
    status: Status.OK,
    ...input,
  });
}

export function traceCustomEvent(input: {
  readonly name: string;
  readonly message: string;
  readonly extra?: unknown;
}): void {
  reporter.send({
    ...getBaseData(),
    type: EventType.Custom,
    status: Status.OK,
    name: input.name,
    message: input.message,
    extra: input.extra,
  });
}

export function tracePageView(
  input: {
    readonly name?: string;
    readonly message?: string;
    readonly extra?: unknown;
  } = {},
): void {
  reporter.send({
    ...getBaseData(),
    type: EventType.PV,
    name: input.name ?? "ManualPageView",
    message: input.message ?? location.href,
    status: Status.OK,
    extra: input.extra ?? {
      url: location.href,
      referrer: document.referrer,
    },
  });
}

export function beforeSend(hook: BeforeSendHook): void {
  sentry.setOptions({ beforeSend: hook });
}

export function beforeSendBatch(hook: BeforeSendBatchHook): void {
  sentry.setOptions({ beforeSendBatch: hook });
}

export function afterSend(hook: AfterSendHook): void {
  sentry.setOptions({ afterSend: hook });
}

export async function flushOfflineCache(): Promise<void> {
  await reporter.flushOfflineCache();
}
