import {
  EventType,
  Status,
  type IBaseDataWithEvent,
  type TEventHandler,
} from "../types";
import {
  event2breadcrumb,
  getDeclarativeClickData,
  isErrorEvent,
  sentryLogger,
} from "../utils";
import reporter from "../reporter";
import breadcrumb from "./breadcrumb.js";
import { handleCodeError } from "./handle-code-error.js";
import { handleError } from "./handle-error.js";

function extractRejectionReason(extra: unknown): unknown {
  if (extra instanceof Event && "reason" in extra) {
    return Reflect.get(extra, "reason");
  }
  return extra;
}

export const handleUnhandledRejection: TEventHandler<IBaseDataWithEvent> = (
  data: IBaseDataWithEvent,
) => {
  const reason = extractRejectionReason(data.extra);
  sentryLogger.error("Unhandled rejection captured", reason);
  if (isErrorEvent(reason)) {
    handleCodeError(reason);
    return;
  }
  handleError({ ...data, extra: reason });
};

export const handleClick: TEventHandler<IBaseDataWithEvent> = ({
  extra,
  ...rest
}: IBaseDataWithEvent) => {
  if (!(extra instanceof MouseEvent)) return;
  const clickData = getDeclarativeClickData(extra);
  if (!clickData) return;
  const data: IBaseDataWithEvent = {
    ...rest,
    type: EventType.Click,
    name: clickData.ev || clickData.msg,
    message: clickData.msg || clickData.ev,
    status: Status.OK,
    extra: clickData,
  };
  breadcrumb.push({ ...data, userAction: event2breadcrumb(EventType.Click) });
  reporter.send(data);
};
