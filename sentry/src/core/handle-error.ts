import {
  EventType,
  Status,
  type IBaseDataWithEvent,
  type IExtendedErrorEvent,
  type IResourceError,
  type TEventHandler,
} from "../types";
import {
  event2breadcrumb,
  isError,
  isErrorEvent,
  isIExtendedErrorEvent,
  isIgnoredError,
  sentryLogger,
} from "../utils";
import reporter from "../reporter";
import breadcrumb from "./breadcrumb.js";
import { reportOncePerError } from "./error-dedup.js";
import { handleCodeError } from "./handle-code-error.js";

export const handleError: TEventHandler<IBaseDataWithEvent> = ({
  extra: err,
  ...rest
}) => {
  sentryLogger.error("Error captured", err);
  if (isErrorEvent(err)) {
    if (!isIgnoredError(err.message)) handleCodeError(err);
    return;
  }
  if (isIExtendedErrorEvent(err)) {
    reportResourceError(err, rest);
    return;
  }
  if (isError(err)) {
    reportRuntimeError(err, rest);
    return;
  }
  reportUnknownError(err, rest);
};

function reportResourceError(
  err: IExtendedErrorEvent,
  rest: Omit<IBaseDataWithEvent, "extra">,
): void {
  const { localName } = err.target;
  const src = err.target.src ?? "";
  const href = err.target.href ?? "";
  const resourceError: IResourceError = {
    ...rest,
    type: EventType.Resource,
    status: Status.Error,
    name: localName,
    src,
    href,
    message: `Failed to load ${localName}: ${src || href}`,
  };
  breadcrumb.push({
    ...resourceError,
    userAction: event2breadcrumb(EventType.Resource),
  });
  reportOncePerError(
    `${EventType.Resource}-${localName}-${src || href}`,
    () => {
      reporter.send(resourceError);
    },
  );
}

function reportRuntimeError(
  err: Error,
  rest: Omit<IBaseDataWithEvent, "extra">,
): void {
  const { name, message, stack } = err;
  if (isIgnoredError(message)) return;
  reportBaseError({
    ...rest,
    type: EventType.Error,
    name,
    message,
    extra: stack || err,
  });
}

function reportUnknownError(
  err: unknown,
  rest: Omit<IBaseDataWithEvent, "extra">,
): void {
  const message = typeof err === "string" ? err : JSON.stringify(err);
  if (isIgnoredError(message)) return;
  reportBaseError({
    ...rest,
    type: EventType.Error,
    name: "Unknown Error",
    message,
    extra: err,
  });
}

function reportBaseError(data: IBaseDataWithEvent): void {
  const payload: IBaseDataWithEvent = { ...data, status: Status.Error };
  breadcrumb.push({
    ...payload,
    userAction: event2breadcrumb(EventType.Error),
  });
  reportOncePerError(
    `${EventType.Error}-${payload.name}-${payload.message}`,
    () => {
      reporter.send(payload);
    },
  );
}
