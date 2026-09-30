import {
  EventType,
  type IBaseDataWithEvent,
  type IRouteData,
  type TEventHandler,
} from "../types";
import { UNKNOWN } from "../constants";
import { event2breadcrumb } from "../utils";
import breadcrumb from "./breadcrumb.js";
import { recordRoutePageView } from "./pv-lifecycle.js";

function isHashChangeEvent(value: unknown): value is HashChangeEvent {
  return value instanceof HashChangeEvent;
}

export const handleHistory: TEventHandler<IRouteData> = ({
  from,
  to,
  ...rest
}: IRouteData) => {
  const routeChange = `${from} => ${to}`;
  const routeData: IRouteData = {
    ...rest,
    name: routeChange,
    message: routeChange,
    type: EventType.History,
    from,
    to,
  };
  breadcrumb.push({
    ...routeData,
    userAction: event2breadcrumb(EventType.History),
  });
  recordRoutePageView(to, from, "HistoryChange");
};

export const handleHashChange: TEventHandler<IBaseDataWithEvent> = ({
  extra,
  ...rest
}: IBaseDataWithEvent) => {
  const from = isHashChangeEvent(extra) ? extra.oldURL : UNKNOWN;
  const to = isHashChangeEvent(extra) ? extra.newURL : UNKNOWN;
  const pathChange = `${from} => ${to}`;
  const routeData: IRouteData = {
    ...rest,
    name: pathChange,
    message: pathChange,
    type: EventType.HashChange,
    from,
    to,
  };
  breadcrumb.push({
    ...routeData,
    userAction: event2breadcrumb(EventType.HashChange),
  });
  recordRoutePageView(to, from, "HashChange");
};
