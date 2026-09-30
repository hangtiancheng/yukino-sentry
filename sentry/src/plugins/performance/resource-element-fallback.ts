import { type IPerformanceResourceTiming } from "../../types";
import { noop } from "../../utils";
import type { Cleanup } from "../../utils/decorate-prop.js";
import {
  createResourceTimingData,
  getResourceList,
  isSdkReportUrl,
} from "./resource-timing.js";
import { supportsPerformanceEntryType } from "./performance-observer-support.js";

type ResourceElement = HTMLImageElement | HTMLScriptElement | HTMLLinkElement;
type PerformanceReporter = (
  data: ReturnType<typeof createResourceTimingData>,
) => void;

const observedElementNames = new Set(["IMG", "SCRIPT", "LINK"]);

interface ElementListener {
  readonly element: ResourceElement;
  readonly eventName: "load" | "error";
  readonly listener: EventListener;
}

function createFallbackResourceTiming(
  url: string,
  initiatorType: string,
): IPerformanceResourceTiming {
  const startTime =
    "performance" in globalThis
      ? Math.round(globalThis.performance.now())
      : Date.now();
  return {
    name: url,
    initiatorType,
    startTime,
    responseEnd: startTime,
    duration: 0,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    fromCache: false,
  };
}

function getElementUrl(element: ResourceElement): string {
  if (element instanceof HTMLImageElement) {
    return element.currentSrc || element.src;
  }
  if (element instanceof HTMLScriptElement) {
    return element.src;
  }
  return element.href;
}

function isResourceElement(node: Node): node is ResourceElement {
  return node instanceof HTMLElement && observedElementNames.has(node.tagName);
}

function findLatestResource(url: string): IPerformanceResourceTiming | null {
  return (
    getResourceList()
      .filter((entry) => entry.name === url)
      .at(-1) ?? null
  );
}

export function observeResourceElementFallback(
  onReport: PerformanceReporter,
): Cleanup {
  if (
    supportsPerformanceEntryType("resource") ||
    !("MutationObserver" in globalThis) ||
    typeof globalThis.MutationObserver !== "function"
  ) {
    return noop;
  }

  const listeners: ElementListener[] = [];
  const reportedUrls = new Set<string>();

  const reportElement = (element: ResourceElement): void => {
    const url = getElementUrl(element);
    if (!url || reportedUrls.has(url) || isSdkReportUrl(url)) {
      return;
    }
    reportedUrls.add(url);
    const resource =
      findLatestResource(url) ??
      createFallbackResourceTiming(url, element.tagName.toLowerCase());
    onReport(createResourceTimingData(resource));
  };

  const observeElement = (element: ResourceElement): void => {
    const listener = () => {
      reportElement(element);
    };
    element.addEventListener("load", listener, { once: true });
    element.addEventListener("error", listener, { once: true });
    listeners.push({ element, eventName: "load", listener });
    listeners.push({ element, eventName: "error", listener });
  };

  const observer = new globalThis.MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (isResourceElement(node)) {
          observeElement(node);
        }
      });
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
    listeners.forEach(({ element, eventName, listener }) => {
      element.removeEventListener(eventName, listener);
    });
  };
}
