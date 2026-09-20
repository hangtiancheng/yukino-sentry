/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { EventType, Status, type IHttpData, type TEventHandler } from "../types";
import { event2breadcrumb, getBaseData, sentryLogger, sentry, transformHttpData } from "../utils";
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
