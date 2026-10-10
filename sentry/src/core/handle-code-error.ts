import {
  EventType,
  Status,
  type IBatchErrorData,
  type ICodeError,
  type IReportPayload,
  type TReportPayload,
} from "../types";
import { event2breadcrumb, getBaseData, isIgnoredError } from "../utils";
import { UNKNOWN } from "../constants";
import reporter from "../reporter";
import breadcrumb from "./breadcrumb.js";
import { reportOncePerError } from "./error-dedup.js";

class BatchErrorManager {
  private cacheError: TReportPayload[] = [];
  private timeoutID: ReturnType<typeof setTimeout> | undefined;

  public push(error: TReportPayload): void {
    this.cacheError.push(error);
    if (this.timeoutID) clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(() => this.flush(), 2000);
  }

  public destroy(): void {
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
      this.timeoutID = undefined;
    }
    this.cacheError = [];
  }

  private flush(): void {
    if (this.cacheError.length === 0) return;
    const groups = new Map<string, TReportPayload[]>();
    for (const err of this.cacheError) {
      const key = `${err.type}-${err.name}-${err.message}`;
      const group = groups.get(key);
      if (group) {
        group.push(err);
      } else {
        groups.set(key, [err]);
      }
    }
    this.cacheError = [];
    for (const items of groups.values()) {
      this.reportGroup(items);
    }
  }

  private reportGroup(items: readonly TReportPayload[]): void {
    const maxLength = 5;
    if (items.length < maxLength) {
      items.forEach((item) => reporter.send(item));
      return;
    }
    const sumItem = items[0];
    if (!sumItem) return;
    const batchErrorData: IBatchErrorData = {
      ...sumItem,
      batchError: true,
      batchErrorLength: items.length,
      batchErrorLastHappenTime: items.at(-1)?.timestamp ?? sumItem.timestamp,
    };
    reporter.send(batchErrorData);
  }
}

const batchErrorManager = new BatchErrorManager();

export function destroyBatchErrorManager(): void {
  batchErrorManager.destroy();
}

export function handleCodeError(err: ErrorEvent): void {
  const { filename, colno: column, lineno: line, message, error } = err;
  if (isIgnoredError(message)) return;
  const data: IReportPayload = {
    ...getBaseData(),
    type: EventType.Error,
    name: filename,
    message,
    status: Status.Error,
  };
  const stack = error instanceof Error && error.stack ? error.stack : undefined;
  const codeError: ICodeError = {
    ...data,
    column,
    line,
    ...(stack ? { extra: stack } : {}),
  };
  breadcrumb.push({ ...data, userAction: event2breadcrumb(EventType.Error) });
  if (!filename || filename === UNKNOWN) {
    batchErrorManager.push(codeError);
    return;
  }
  reportOncePerError(
    `${EventType.Error}-${message}-${filename}-${line}-${column}`,
    () => {
      batchErrorManager.push(codeError);
    },
  );
}
