import { EventType, type IPub, type ISub, type TEventHandler } from "../types";
import { sentryLogger } from "../utils";
import type { Cleanup } from "../utils/decorate-prop.js";

const event2handlers = new Map<EventType, Set<TEventHandler>>();

export const pub: IPub = (type, data) => {
  const handlers = event2handlers.get(type);
  if (!handlers) {
    return;
  }
  for (const handler of handlers) {
    try {
      handler(data);
    } catch (err) {
      sentryLogger.error("Error executing event handler", err);
    }
  }
};

export const sub: ISub = (type, handler) => {
  const handlers = event2handlers.get(type);
  if (!handlers) {
    event2handlers.set(type, new Set([handler]));
    return () => {
      event2handlers.get(type)?.delete(handler);
    };
  }
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
};

export const clearSubscriptions: Cleanup = () => {
  event2handlers.clear();
};
