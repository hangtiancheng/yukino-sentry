import { sentryLogger } from "../utils";
import type { Cleanup } from "../utils/decorate-prop.js";

interface NetworkListenerCallbacks {
  readonly setOnline: (online: boolean) => void;
  readonly flush: () => Promise<void>;
}

export function initNetworkListener(
  callbacks: NetworkListenerCallbacks,
): Cleanup {
  callbacks.setOnline(navigator.onLine !== false);
  const onOnline = () => {
    callbacks.setOnline(true);
    sentryLogger.info("Network is back online, flushing cache");
    void callbacks.flush();
  };
  const onOffline = () => {
    callbacks.setOnline(false);
    sentryLogger.info("Network is offline, caching events");
  };
  globalThis.addEventListener("online", onOnline);
  globalThis.addEventListener("offline", onOffline);
  return () => {
    globalThis.removeEventListener("online", onOnline);
    globalThis.removeEventListener("offline", onOffline);
  };
}
