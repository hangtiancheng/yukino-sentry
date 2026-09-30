import {
  EventType,
  Status,
  type IHttpData,
  type TEventHandler,
} from "../types";
import {
  event2breadcrumb,
  getBaseData,
  sentryLogger,
  sentry,
  transformHttpData,
} from "../utils";
import reporter from "../reporter";
import breadcrumb from "./breadcrumb.js";

export const handleHttp: TEventHandler<IHttpData> = (data: IHttpData) => {
  const transformedData = transformHttpData(data);
  const { id, name, time, timestamp, message, status, type } = transformedData;

  if (status === Status.Error) {
    sentryLogger.error(`Request error: ${name}`, data);
  } else {
    sentryLogger.info(`Request complete: ${name}`, data);
  }

  if (!transformedData.api.includes(sentry.options.dsn)) {
    breadcrumb.push({
      id,
      name,
      time,
      timestamp,
      message,
      status,
      type,
      userAction: event2breadcrumb(type),
    });
  }
  if (status === Status.Error) {
    reporter.send(transformedData);
    return;
  }
  if (sentry.options.enableHttpPerformance) {
    reporter.send({
      ...getBaseData(),
      type: EventType.Performance,
      name: `HTTP ${transformedData.method}`,
      message: transformedData.api,
      status: Status.OK,
      value: transformedData.elapsedTime,
      extra: {
        method: transformedData.method,
        statusCode: transformedData.statusCode,
        serverTiming: transformedData.serverTiming ?? [],
      },
    });
  }
};
