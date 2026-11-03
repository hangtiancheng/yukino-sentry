import type { IDataReporter, IReportData, TReportPayload } from "../types";
import { generateUUID, sentryLogger, sentry } from "../utils";
import type { Cleanup } from "../utils/decorate-prop.js";
import { stringify } from "../utils/stringify.js";
import { scheduleFlush } from "./flush-scheduler.js";
import { initNetworkListener } from "./network-listener.js";
import {
  clearOfflineCache,
  loadOfflineCache,
  saveOfflineCache,
} from "./offline-cache.js";
import { isPromise } from "./promise.js";
import { applyBeforePushHook, runBeforeReportHook } from "./report-data.js";
import { shouldQueuePayload } from "./send-preflight.js";
import {
  resetServerRecovery,
  scheduleServerRecovery,
} from "./server-recovery.js";
import {
  getBodyByteLength,
  MAX_KEEPALIVE_BYTES,
  reportByFetch,
  sendBeacon,
} from "./transports.js";

export class DataReporter implements IDataReporter {
  id = generateUUID();
  private events: IReportData[] = [];
  private timeoutID?: ReturnType<typeof setTimeout>;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private isOnline = true;
  private isFlushing = false;
  private inFlight: Promise<void> | undefined;
  private pendingReports = new Set<Promise<IReportData | null>>();
  private disposed = false;
  private hasPersistedCache = false;
  private removeNetworkListener: Cleanup;

  constructor() {
    this.removeNetworkListener = initNetworkListener({
      setOnline: (online) => {
        this.isOnline = online;
      },
      flush: () => this.flush(),
    });
    this.loadOfflineCache();
  }

  dispose(): void {
    this.disposed = true;
    if (this.timeoutID) clearTimeout(this.timeoutID);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.removeNetworkListener();
    this.events = [];
    this.isFlushing = false;
  }

  private loadOfflineCache(): void {
    this.events.unshift(...loadOfflineCache());
    this.events = this.events.slice(-sentry.options.maxQueueLength);
  }

  private saveOfflineCache(): void {
    saveOfflineCache(this.events);
    this.hasPersistedCache = true;
  }

  private clearPersistedCache(): void {
    if (!this.hasPersistedCache) return;
    clearOfflineCache();
    this.hasPersistedCache = false;
  }

  private handleServerError(): void {
    if (this.disposed) return;
    this.retryTimer = scheduleServerRecovery(this.retryTimer, {
      isActive: () => !this.disposed,
      setOnline: (online) => {
        this.isOnline = online;
      },
      setRetryTimer: (timer) => {
        this.retryTimer = timer;
      },
      flush: () => this.flush(),
    });
  }

  async flush(): Promise<void> {
    do {
      await Promise.allSettled([...this.pendingReports]);
      if (this.disposed) return;
      if (this.inFlight) await this.inFlight;
      if (!this.isOnline || this.disposed) return;
      await this.flushBatch();
    } while (
      !this.disposed &&
      this.isOnline &&
      (this.events.length > 0 || this.pendingReports.size > 0)
    );
  }

  private flushBatch(): Promise<void> {
    if (this.disposed || this.events.length === 0 || this.isFlushing) {
      return Promise.resolve();
    }
    this.isFlushing = true;
    const task = this.sendNextBatch();
    this.inFlight = task;
    void task.then(() => {
      if (this.inFlight === task) this.inFlight = undefined;
    });
    return task;
  }

  private async sendNextBatch(): Promise<void> {
    try {
      if (!this.isOnline) {
        this.events = this.events.slice(-sentry.options.maxQueueLength);
        this.saveOfflineCache();
        return;
      }
      const batch = this.takeBatch();
      const finalSendData = isPromise(batch) ? await batch : batch;
      if (this.disposed) return;
      if (finalSendData.length === 0) {
        this.scheduleNextFlush();
        return;
      }
      const startTime = performance.now();
      const sendResult = this.sendBatch(finalSendData);
      const ok = isPromise(sendResult) ? await sendResult : sendResult;
      if (this.disposed) return;
      if (!ok) {
        this.events = [...finalSendData, ...this.events].slice(
          -sentry.options.maxQueueLength,
        );
        this.saveOfflineCache();
        return;
      }
      this.clearPersistedCache();
      try {
        const result = sentry.options.afterSend?.(finalSendData);
        if (result)
          void result.catch((err) =>
            sentryLogger.error("afterSend hook failed", err),
          );
      } catch (err) {
        sentryLogger.error("afterSend hook failed", err);
      }
      sentryLogger.success(
        "Batch report queued or sent",
        { count: finalSendData.length },
        Math.round(performance.now() - startTime),
      );
    } catch (err) {
      sentryLogger.error("Failed to prepare report batch", err);
    } finally {
      this.isFlushing = false;
    }
    this.scheduleNextFlush();
  }

  private takeBatch(): IReportData[] | Promise<IReportData[]> {
    const maxItems = sentry.options.cacheMaxLength;
    const sendData = this.events.slice(0, maxItems);
    this.events = this.events.slice(maxItems);
    return applyBeforePushHook(sendData);
  }

  private sendBatch(
    finalSendData: readonly IReportData[],
  ): Promise<boolean> | boolean {
    const body = stringify(finalSendData);
    const withinKeepaliveBudget =
      getBodyByteLength(body) <= MAX_KEEPALIVE_BYTES;
    if (withinKeepaliveBudget && sendBeacon(body)) return true;
    return reportByFetch(body, withinKeepaliveBudget, () =>
      this.handleServerError(),
    );
  }

  private scheduleNextFlush(): void {
    if (this.disposed || this.events.length === 0) return;
    this.timeoutID = scheduleFlush(this.timeoutID, 100, () =>
      this.flushBatch(),
    );
  }

  async flushOfflineCache(): Promise<void> {
    this.loadOfflineCache();
    await this.flush();
  }

  async send(payload: TReportPayload, immediate = false): Promise<void> {
    const options = sentry.options;
    if (this.disposed || !shouldQueuePayload(payload)) return;
    let data: IReportData | null;
    try {
      const reportResult = runBeforeReportHook(this.id, payload);
      if (isPromise(reportResult)) {
        this.pendingReports.add(reportResult);
        try {
          data = await reportResult;
        } finally {
          this.pendingReports.delete(reportResult);
        }
      } else {
        data = reportResult;
      }
    } catch (err) {
      sentryLogger.error("beforeSend hook failed", err);
      return;
    }
    if (!data || this.disposed) return;
    sentryLogger.info(`Type: ${payload.type}`, data);
    this.events.push(data);
    this.events = this.events.slice(-options.maxQueueLength);
    if (!this.isOnline) {
      this.saveOfflineCache();
      return;
    }
    if (this.timeoutID) clearTimeout(this.timeoutID);
    if (immediate || this.events.length >= options.cacheMaxLength) {
      await this.flushBatch();
      return;
    }
    this.timeoutID = scheduleFlush(
      this.timeoutID,
      options.cacheWaitingTime,
      () => this.flushBatch(),
    );
  }
}

let instance: DataReporter | null = null;

export function resetReporter(): void {
  instance?.dispose();
  instance = null;
  resetServerRecovery();
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default new Proxy({} as DataReporter, {
  get(_target, prop) {
    instance ??= new DataReporter();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
