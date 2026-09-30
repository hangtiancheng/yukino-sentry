import { EventType } from "../types";
import { throttle, sentry, decorateProp, getBaseData, noop } from "../utils";
import type { Cleanup } from "../utils/decorate-prop.js";
import { pub } from "./bus.js";
import { pubFetch, pubXhr } from "./decorate-http.js";
import { pubHistory } from "./decorate-route.js";

function decoratePublish(type: EventType): Cleanup {
  switch (type) {
    case EventType.Click: {
      return pubClick();
    }
    case EventType.Error: {
      return pubError();
    }
    case EventType.Xhr: {
      return pubXhr();
    }
    case EventType.Fetch: {
      return pubFetch();
    }
    case EventType.History: {
      return pubHistory();
    }
    case EventType.UnhandledRejection: {
      return pubUnhandledRejection();
    }
    case EventType.HashChange: {
      return pubHashChange();
    }
    default: {
      return noop;
    }
  }
}

function pubClick(): Cleanup {
  const throttledPub = throttle(pub, sentry.options.clickThrottleDelay);
  const listener = function (ctx: MouseEvent) {
    throttledPub(EventType.Click, {
      ...getBaseData(),
      type: EventType.Click,
      extra: ctx,
    });
  };
  document.addEventListener("click", listener);
  return () => {
    document.removeEventListener("click", listener);
  };
}

function stringifyConsoleArg(arg: unknown): string {
  if (typeof arg === "string") return arg;
  if (arg instanceof Error) return arg.message;
  try {
    return JSON.stringify(arg) ?? String(arg);
  } catch {
    return String(arg);
  }
}

function pubError(): Cleanup {
  const listener = function (ctx: ErrorEvent) {
    pub(EventType.Error, {
      ...getBaseData(),
      type: EventType.Error,
      extra: ctx,
    });
  };
  globalThis.addEventListener("error", listener, true);
  let isPublishingConsoleError = false;
  const cleanupConsoleError = decorateProp(console, "error", (oldPropVal) => {
    return function (this: Console, ...args: unknown[]) {
      if (!isPublishingConsoleError) {
        isPublishingConsoleError = true;
        try {
          pub(EventType.Error, {
            ...getBaseData(),
            type: EventType.Error,
            extra:
              args.find((arg) => arg instanceof Error) ??
              args.map(stringifyConsoleArg).join(" "),
          });
        } finally {
          isPublishingConsoleError = false;
        }
      }
      oldPropVal.call(this, ...args);
    };
  });
  return () => {
    globalThis.removeEventListener("error", listener, true);
    cleanupConsoleError();
  };
}

function pubUnhandledRejection(): Cleanup {
  const listener = function (ctx: PromiseRejectionEvent) {
    pub(EventType.UnhandledRejection, {
      ...getBaseData(),
      type: EventType.UnhandledRejection,
      extra: ctx,
    });
  };
  globalThis.addEventListener("unhandledrejection", listener);
  return () => {
    globalThis.removeEventListener("unhandledrejection", listener);
  };
}

function pubHashChange(): Cleanup {
  const listener = function (ctx: HashChangeEvent) {
    pub(EventType.HashChange, {
      ...getBaseData(),
      type: EventType.HashChange,
      extra: ctx,
    });
  };
  globalThis.addEventListener("hashchange", listener);
  return () => {
    globalThis.removeEventListener("hashchange", listener);
  };
}

export default decoratePublish;
