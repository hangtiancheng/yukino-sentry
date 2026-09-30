import { EventType } from "../types";
import { decorateProp, getBaseData } from "../utils";
import type { Cleanup } from "../utils/decorate-prop.js";
import { pub } from "./bus.js";

let latestHref = "";

function getCurrentRouteUrl(): string {
  return globalThis.location?.href ?? "";
}

function normalizeRouteUrl(url: string | URL): string {
  return new URL(url.toString(), getCurrentRouteUrl()).href;
}

export function pubHistory(): Cleanup {
  latestHref = getCurrentRouteUrl();

  const popstateListener = () => {
    const from = latestHref;
    const to = getCurrentRouteUrl();
    if (from === to) {
      return;
    }
    latestHref = to;
    pub(EventType.History, {
      ...getBaseData(),
      type: EventType.History,
      from,
      to,
    });
  };
  globalThis.addEventListener("popstate", popstateListener);

  const historyDecorator = (oldPropsVal: History["pushState"]) => {
    return function (
      this: History,
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      if (!url) {
        return oldPropsVal.call(this, data, unused, url);
      }
      const from = latestHref;
      const to = normalizeRouteUrl(url);
      // Apply the navigation first so handlers observe the destination href
      const result = oldPropsVal.call(this, data, unused, url);
      if (from !== to) {
        latestHref = to;
        pub(EventType.History, {
          ...getBaseData(),
          type: EventType.History,
          from,
          to,
        });
      }
      return result;
    };
  };
  const cleanupPushState = decorateProp(
    globalThis.history,
    "pushState",
    historyDecorator,
  );
  const cleanupReplaceState = decorateProp(
    globalThis.history,
    "replaceState",
    historyDecorator,
  );
  return () => {
    globalThis.removeEventListener("popstate", popstateListener);
    cleanupReplaceState();
    cleanupPushState();
  };
}
