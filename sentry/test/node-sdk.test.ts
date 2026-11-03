// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import * as nodeSdk from "@/node/index.js";
import { getDeviceId, getSessionId } from "@/utils/index.js";

const DSN = "http://127.0.0.1:65535/api/log";

type FetchMock = Mock<
  [input: RequestInfo | URL, init?: RequestInit | undefined],
  Promise<Response>
>;

interface ReportRecord {
  projectId: string;
  userId: string;
  url: string;
  payload: {
    type: string;
    message: string;
    statusCode?: number;
    api?: string;
  };
}

function okResponse(): Response {
  return new Response(null, { status: 200 });
}

function emitUncaughtExceptionHidden(error: Error): void {
  const saved = process.rawListeners("uncaughtException");
  const sdkListener = saved.at(-1);
  process.removeAllListeners("uncaughtException");
  try {
    if (sdkListener) {
      Reflect.apply(process.on, process, ["uncaughtException", sdkListener]);
      process.emit("uncaughtException", error);
    }
  } finally {
    process.removeAllListeners("uncaughtException");
    for (const listener of saved) {
      Reflect.apply(process.on, process, ["uncaughtException", listener]);
    }
  }
}

function emitUnhandledRejectionHidden(reason: unknown): void {
  const saved = process.rawListeners("unhandledRejection");
  const sdkListener = saved.at(-1);
  process.removeAllListeners("unhandledRejection");
  try {
    if (sdkListener) {
      Reflect.apply(process.on, process, ["unhandledRejection", sdkListener]);
      process.emit("unhandledRejection", reason, Promise.resolve());
    }
  } finally {
    process.removeAllListeners("unhandledRejection");
    for (const listener of saved) {
      Reflect.apply(process.on, process, ["unhandledRejection", listener]);
    }
  }
}

describe("@yukino.js/sentry/node export surface", () => {
  it("mirrors the @sentry/node style API surface", () => {
    expect(nodeSdk.init).toBeTypeOf("function");
    expect(nodeSdk.destroy).toBeTypeOf("function");
    expect(nodeSdk.isInitialized).toBeTypeOf("function");
    expect(nodeSdk.enablePlugin).toBeTypeOf("function");
    expect(nodeSdk.traceError).toBeTypeOf("function");
    expect(nodeSdk.tracePerformance).toBeTypeOf("function");
    expect(nodeSdk.traceCustomEvent).toBeTypeOf("function");
    expect(nodeSdk.setUserId).toBeTypeOf("function");
    expect(nodeSdk.setVisitorId).toBeTypeOf("function");
    expect(nodeSdk.getIdentity).toBeTypeOf("function");
    expect(nodeSdk.beforeSend).toBeTypeOf("function");
    expect(nodeSdk.beforeSendBatch).toBeTypeOf("function");
    expect(nodeSdk.afterSend).toBeTypeOf("function");
    expect(nodeSdk.flush).toBeTypeOf("function");
    expect(nodeSdk.flushOfflineCache).toBeTypeOf("function");
    expect(nodeSdk.reportFrameworkError).toBeTypeOf("function");
    expect(nodeSdk.SentryPlugin).toBeTypeOf("function");
    expect(nodeSdk.EventType.Error).toBe("Error");
  });

  it("does not expose browser-only APIs", () => {
    expect(Object.hasOwn(nodeSdk, "tracePageView")).toBe(false);
  });
});

describe("node lifecycle", () => {
  afterEach(() => {
    nodeSdk.destroy();
  });

  it("does not initialize with an empty dsn", () => {
    nodeSdk.init({ dsn: "" });
    expect(nodeSdk.isInitialized()).toBe(false);
  });

  it("initializes once and resets on destroy", () => {
    nodeSdk.init({ dsn: DSN });
    expect(nodeSdk.isInitialized()).toBe(true);
    nodeSdk.init({ dsn: DSN });
    expect(nodeSdk.isInitialized()).toBe(true);
    nodeSdk.destroy();
    expect(nodeSdk.isInitialized()).toBe(false);
  });

  it("warns when the dsn is not an absolute URL", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    nodeSdk.init({ dsn: "/api/log" });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("absolute URL"),
    );
    warnSpy.mockRestore();
  });

  it("installs and removes process listeners", () => {
    const beforeUncaught = process.listenerCount("uncaughtException");
    const beforeRejection = process.listenerCount("unhandledRejection");
    nodeSdk.init({ dsn: DSN });
    expect(process.listenerCount("uncaughtException")).toBe(beforeUncaught + 1);
    expect(process.listenerCount("unhandledRejection")).toBe(
      beforeRejection + 1,
    );
    nodeSdk.destroy();
    expect(process.listenerCount("uncaughtException")).toBe(beforeUncaught);
    expect(process.listenerCount("unhandledRejection")).toBe(beforeRejection);
  });

  it("respects capture switches", () => {
    const beforeUncaught = process.listenerCount("uncaughtException");
    const originalFetch = globalThis.fetch;
    nodeSdk.init({
      dsn: DSN,
      enableError: false,
      enableUnhandledRejection: false,
      enableFetch: false,
    });
    expect(process.listenerCount("uncaughtException")).toBe(beforeUncaught);
    expect(globalThis.fetch).toBe(originalFetch);
    nodeSdk.destroy();
  });
});

describe("node identity", () => {
  it("keeps stable device and session ids per process", () => {
    expect(getDeviceId()).toBe(getDeviceId());
    expect(getSessionId()).toBe(getSessionId());
  });

  it("tracks user identity", () => {
    nodeSdk.setUserId("node-user");
    nodeSdk.setVisitorId("node-visitor");
    const identity = nodeSdk.getIdentity();
    expect(identity.userId).toBe("node-user");
    expect(identity.visitorId).toBe("node-visitor");
    expect(identity.hasVisitorId).toBe(true);
  });
});

describe("node reporting", () => {
  let fetchMock: FetchMock;
  let fetchCalls: [RequestInfo | URL, (RequestInit | undefined)?][];
  let exitCode: number | undefined;
  const realExit = process.exit;

  function mockProcessExit(): void {
    exitCode = undefined;
    Object.defineProperty(process, "exit", {
      configurable: true,
      writable: true,
      value: (code?: number) => {
        exitCode = code;
      },
    });
  }

  function restoreProcessExit(): void {
    Object.defineProperty(process, "exit", {
      configurable: true,
      writable: true,
      value: realExit,
    });
  }

  beforeEach(() => {
    fetchCalls = [];
    fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      fetchCalls.push([input, init]);
      return Promise.resolve(okResponse());
    });
    vi.stubGlobal("fetch", fetchMock);
    mockProcessExit();
  });

  afterEach(() => {
    nodeSdk.destroy();
    restoreProcessExit();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function firstReportBody(): ReportRecord[] {
    const call = fetchCalls.find(([url]) => url === DSN);
    const body = call?.[1]?.body;
    return JSON.parse(typeof body === "string" ? body : "[]");
  }

  it("delivers manual error reports via fetch on flush", async () => {
    nodeSdk.init({ dsn: DSN, projectId: "node-svc", userId: "u-node" });
    nodeSdk.traceError(new Error("manual-boom"));
    await nodeSdk.flush();

    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0]?.[0]).toBe(DSN);
    const body = firstReportBody();
    expect(body).toHaveLength(1);
    expect(body[0]?.projectId).toBe("node-svc");
    expect(body[0]?.userId).toBe("u-node");
    expect(body[0]?.url).toBe("");
    expect(body[0]?.payload.type).toBe(nodeSdk.EventType.Error);
    expect(body[0]?.payload.message).toBe("manual-boom");
  });

  it("delivers custom events and performance traces", async () => {
    nodeSdk.init({ dsn: DSN });
    nodeSdk.traceCustomEvent({
      name: "JobFinished",
      message: "nightly export",
      extra: { rows: 10 },
    });
    nodeSdk.tracePerformance({ name: "db", message: "query", value: 42 });
    await nodeSdk.flush();

    const body = firstReportBody();
    expect(body).toHaveLength(2);
    const types = body.map((item) => item.payload.type);
    expect(types).toContain(nodeSdk.EventType.Custom);
    expect(types).toContain(nodeSdk.EventType.Performance);
  });

  it("captures uncaught exceptions, flushes, then exits", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    nodeSdk.init({ dsn: DSN });

    emitUncaughtExceptionHidden(new Error("crash-boom"));

    await vi.waitFor(() => {
      expect(exitCode).toBe(1);
    });
    const body = firstReportBody();
    expect(body).toHaveLength(1);
    expect(body[0]?.payload.message).toBe("crash-boom");
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("shutting down"),
      expect.any(Error),
    );
  });

  it("keeps the process alive when exitOnUncaughtException is false", async () => {
    nodeSdk.init({ dsn: DSN, exitOnUncaughtException: false });

    emitUncaughtExceptionHidden(new Error("survivable-boom"));

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(DSN, expect.anything());
    });
    expect(exitCode).toBeUndefined();
  });

  it("warn mode reports unhandled rejections without crashing", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    nodeSdk.init({ dsn: DSN, unhandledRejectionMode: "warn" });

    emitUnhandledRejectionHidden(new Error("warn-boom"));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unhandled promise rejection"),
      expect.any(Error),
    );
    await nodeSdk.flush();
    const body = firstReportBody();
    expect(body).toHaveLength(1);
    expect(body[0]?.payload.message).toBe("warn-boom");
    expect(exitCode).toBeUndefined();
  });

  it("none mode reports unhandled rejections silently", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    nodeSdk.init({ dsn: DSN, unhandledRejectionMode: "none" });

    emitUnhandledRejectionHidden(new Error("none-boom"));

    expect(warnSpy).not.toHaveBeenCalled();
    await nodeSdk.flush();
    expect(firstReportBody()).toHaveLength(1);
    expect(exitCode).toBeUndefined();
  });

  it("strict mode flushes once and exits even when uncaught capture is disabled", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    nodeSdk.init({
      dsn: DSN,
      enableError: false,
      exitOnUncaughtException: false,
    });

    emitUnhandledRejectionHidden(new Error("strict-boom"));

    await vi.advanceTimersByTimeAsync(1);
    expect(exitCode).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(DSN, expect.anything());
  });

  it("captures outbound fetch errors", async () => {
    nodeSdk.init({ dsn: DSN });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));

    const res = await fetch("http://127.0.0.1:65535/downstream");
    expect(res.status).toBe(500);

    await vi.waitFor(async () => {
      await nodeSdk.flush();
      expect(fetchMock).toHaveBeenCalledWith(DSN, expect.anything());
    });
    const body = firstReportBody();
    expect(body[0]?.payload.type).toBe(nodeSdk.EventType.Fetch);
    expect(body[0]?.payload.statusCode).toBe(500);
    expect(body[0]?.payload.api).toBe("http://127.0.0.1:65535/downstream");
  });

  it("restores global fetch after destroy", () => {
    const stubbedFetch = globalThis.fetch;
    nodeSdk.init({ dsn: DSN });
    expect(globalThis.fetch).not.toBe(stubbedFetch);
    nodeSdk.destroy();
    expect(globalThis.fetch).toBe(stubbedFetch);
  });

  it("flushOfflineCache resolves without browser storage", async () => {
    nodeSdk.init({ dsn: DSN });
    await expect(nodeSdk.flushOfflineCache()).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("flush waits for async beforeSend and drains every batch", async () => {
    let release = () => {};
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    nodeSdk.init({
      dsn: DSN,
      cacheMaxLength: 2,
      beforeSend: async (data) => {
        await ready;
        return data;
      },
    });
    for (let i = 0; i < 5; i++) {
      nodeSdk.traceCustomEvent({ name: `job-${i}`, message: "finished" });
    }
    let flushed = false;
    const flushing = nodeSdk.flush().then(() => {
      flushed = true;
    });
    await Promise.resolve();
    expect(flushed).toBe(false);
    expect(fetchCalls).toHaveLength(0);
    release();
    await flushing;
    expect(fetchCalls).toHaveLength(3);
    const reports = fetchCalls.flatMap(([, options]) =>
      JSON.parse(String(options?.body)),
    );
    expect(reports.map((item) => item.name)).toEqual([
      "job-0",
      "job-1",
      "job-2",
      "job-3",
      "job-4",
    ]);
  });

  it("flush waits for an in-flight request before draining queued reports", async () => {
    let release = () => {};
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          release = () => resolve(okResponse());
        }),
    );
    nodeSdk.init({ dsn: DSN, cacheMaxLength: 1 });
    nodeSdk.traceError(new Error("first"));
    nodeSdk.traceError(new Error("second"));
    let flushed = false;
    const flushing = nodeSdk.flush().then(() => {
      flushed = true;
    });
    await Promise.resolve();
    expect(flushed).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    release();
    await flushing;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("repeated init preserves the active rejection policy", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    nodeSdk.init({ dsn: DSN, unhandledRejectionMode: "warn" });
    nodeSdk.init({ dsn: DSN });
    emitUnhandledRejectionHidden(new Error("policy"));
    await nodeSdk.flush();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(exitCode).toBeUndefined();
  });

  it("validates node-specific options before installing listeners", () => {
    const count = process.listenerCount("unhandledRejection");
    expect(() =>
      nodeSdk.init(
        JSON.parse(
          '{"dsn":"http://localhost","unhandledRejectionMode":"typo"}',
        ),
      ),
    ).toThrow();
    expect(nodeSdk.isInitialized()).toBe(false);
    expect(process.listenerCount("unhandledRejection")).toBe(count);
  });

  it("does not send manual reports when disabled", async () => {
    nodeSdk.init({ dsn: DSN, disabled: true });
    nodeSdk.traceError(new Error("disabled"));
    await nodeSdk.flush();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("handles non-Error rejection reasons including cycles and bigint", async () => {
    const cycle: Record<string, unknown> = { code: 10n };
    cycle.self = cycle;
    nodeSdk.init({
      dsn: DSN,
      unhandledRejectionMode: "none",
      ignoreErrors: ["ignore-me"],
    });
    for (const reason of [undefined, null, Symbol("rejected"), 10n, cycle]) {
      emitUnhandledRejectionHidden(reason);
    }
    await nodeSdk.flush();
    expect(firstReportBody()).toHaveLength(5);
    expect(firstReportBody().map((item) => item.payload.message)).toEqual([
      "undefined",
      "null",
      "Symbol(rejected)",
      "10",
      '{"code":"10","self":"[Circular]"}',
    ]);
  });

  it("captures multiple nonfatal uncaught exceptions without dropping the second", async () => {
    nodeSdk.init({ dsn: DSN, exitOnUncaughtException: false });
    emitUncaughtExceptionHidden(new Error("nonfatal-1"));
    emitUncaughtExceptionHidden(new Error("nonfatal-2"));
    await nodeSdk.flush();
    expect(firstReportBody()).toHaveLength(2);
    expect(exitCode).toBeUndefined();
  });

  it("bounds fatal flushing even when beforeSend never resolves", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    nodeSdk.init({ dsn: DSN, beforeSend: () => new Promise(() => {}) });
    emitUncaughtExceptionHidden(new Error("blocked-hook"));
    await vi.advanceTimersByTimeAsync(2000);
    expect(exitCode).toBe(1);
  });

  it("destroy cancels pending fatal handling", async () => {
    vi.useFakeTimers();
    nodeSdk.init({ dsn: DSN, beforeSend: () => new Promise(() => {}) });
    emitUncaughtExceptionHidden(new Error("old-lifecycle"));
    nodeSdk.destroy();
    nodeSdk.init({ dsn: DSN });
    await vi.advanceTimersByTimeAsync(2000);
    expect(exitCode).toBeUndefined();
  });

  it("does not retain hooks or revive reports after destroy and reinit", async () => {
    let release = () => {};
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    const hook = vi.fn(async (data: nodeSdk.IReportData) => {
      await ready;
      return data;
    });
    nodeSdk.init({ dsn: DSN, beforeSend: hook });
    nodeSdk.traceError(new Error("discarded"));
    nodeSdk.destroy();
    nodeSdk.init({ dsn: DSN });
    nodeSdk.traceError(new Error("new-lifecycle"));
    release();
    await nodeSdk.flush();
    expect(hook).toHaveBeenCalledTimes(1);
    expect(firstReportBody().map((item) => item.payload.message)).toEqual([
      "new-lifecycle",
    ]);
  });

  it("isolates rejected reporter hooks from process-level crash capture", async () => {
    nodeSdk.init({
      dsn: DSN,
      beforeSend: async () => {
        throw new Error("hook-failed");
      },
    });
    nodeSdk.traceError(new Error("dropped"));
    await nodeSdk.flush();
    nodeSdk.beforeSend((data) => data);
    nodeSdk.beforeSendBatch(async () => {
      throw new Error("batch-hook-failed");
    });
    nodeSdk.traceError(new Error("dropped-batch"));
    await nodeSdk.flush();
    nodeSdk.beforeSendBatch((data) => data);
    nodeSdk.afterSend(async () => {
      throw new Error("after-hook-failed");
    });
    nodeSdk.traceError(new Error("delivered"));
    await nodeSdk.flush();
    expect(firstReportBody()).toHaveLength(1);
    expect(exitCode).toBeUndefined();
  });

  it("serializes shared context independently in every report", async () => {
    nodeSdk.init({ dsn: DSN });
    const extra = { job: "shared" };
    nodeSdk.traceCustomEvent({ name: "first", message: "first", extra });
    nodeSdk.traceCustomEvent({ name: "second", message: "second", extra });
    await nodeSdk.flush();
    expect(firstReportBody()).toEqual([
      expect.objectContaining({
        deviceInfo: expect.any(Object),
        payload: expect.objectContaining({ extra }),
      }),
      expect.objectContaining({
        deviceInfo: expect.any(Object),
        payload: expect.objectContaining({ extra }),
      }),
    ]);
  });

  it("does not capture the SDK's recovery probes", async () => {
    const beforeSend = vi.fn((data: nodeSdk.IReportData) => data);
    nodeSdk.init({ dsn: DSN, enableHttpPerformance: true, beforeSend });
    await fetch(DSN, { method: "HEAD" });
    await nodeSdk.flush();
    expect(beforeSend).not.toHaveBeenCalled();
  });

  it("keeps the queue bounded while a transport is stalled", async () => {
    let release = () => {};
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          release = () => resolve(okResponse());
        }),
    );
    const names: string[] = [];
    nodeSdk.init({
      dsn: DSN,
      cacheMaxLength: 1,
      maxQueueLength: 2,
      afterSend: (events) => {
        names.push(...events.map((item) => item.name));
      },
    });
    for (let i = 0; i < 5; i++)
      nodeSdk.traceCustomEvent({ name: `queued-${i}`, message: "finished" });
    release();
    await nodeSdk.flush();
    expect(names).toEqual(["queued-0", "queued-3", "queued-4"]);
  });
});
