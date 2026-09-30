import { afterEach, vi } from "vitest";
import { JSDOM } from "jsdom";

if (!globalThis.localStorage) {
  const dom = new JSDOM("", { url: "http://localhost" });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: dom.window.localStorage,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: dom.window.sessionStorage,
  });
}

const uuid = "00000000-0000-4000-8000-000000000000";

Object.defineProperty(globalThis.crypto, "randomUUID", {
  configurable: true,
  value: vi.fn(() => uuid),
});

Object.defineProperty(navigator, "sendBeacon", {
  configurable: true,
  value: vi.fn(() => true),
});

Object.defineProperty(globalThis, "requestIdleCallback", {
  configurable: true,
  value: (callback: IdleRequestCallback) => {
    const deadline: IdleDeadline = {
      didTimeout: false,
      timeRemaining: () => 10,
    };
    callback(deadline);
    return 1;
  },
});

Object.defineProperty(globalThis, "cancelIdleCallback", {
  configurable: true,
  value: vi.fn(),
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.useRealTimers();
});
