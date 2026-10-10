import { isHTMLElement, noop } from "../../utils";
import type { Cleanup } from "../../utils/decorate-prop.js";

type Callback = (value: number) => void;

const excludedElementNames = new Set(["link", "script", "style"]);

function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.right > 0 &&
    rect.bottom > 0 &&
    rect.left < globalThis.innerWidth &&
    rect.top < globalThis.innerHeight
  );
}

function hasInViewportAddition(
  mutationList: readonly MutationRecord[],
): boolean {
  for (const mutation of mutationList) {
    if (!isHTMLElement(mutation.target)) {
      continue;
    }
    if (!mutation.addedNodes.length || !isInViewport(mutation.target)) {
      continue;
    }
    for (const node of mutation.addedNodes) {
      if (
        isHTMLElement(node) &&
        !excludedElementNames.has(node.tagName.toLowerCase()) &&
        isInViewport(node)
      ) {
        return true;
      }
    }
  }
  return false;
}

export function getFirstScreenPaint(callback: Callback): Cleanup {
  if (typeof globalThis.MutationObserver !== "function") {
    callback(0);
    return noop;
  }

  let latestRenderTime = 0;
  let requestId = 0;
  let done = false;
  let hasObservedTarget = false;
  let intersectionObserver: IntersectionObserver | null = null;

  const processIntersectionEntries = (
    entries: readonly IntersectionObserverEntry[],
  ) => {
    if (done || !intersectionObserver) return;
    for (const entry of entries) {
      intersectionObserver.unobserve(entry.target);
      if (entry.isIntersecting) {
        latestRenderTime = Math.max(latestRenderTime, entry.time);
      }
    }
  };

  if (typeof globalThis.IntersectionObserver === "function") {
    intersectionObserver = new globalThis.IntersectionObserver(
      processIntersectionEntries,
    );
  }

  const processMutations = (mutationList: readonly MutationRecord[]) => {
    if (done) return;
    if (!intersectionObserver) {
      if (hasInViewportAddition(mutationList)) {
        latestRenderTime = globalThis.performance.now();
      }
      return;
    }
    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (
          isHTMLElement(node) &&
          !excludedElementNames.has(node.tagName.toLowerCase())
        ) {
          hasObservedTarget = true;
          intersectionObserver.observe(node);
        }
      }
    }
  };

  const mutationObserver = new globalThis.MutationObserver(processMutations);

  const finish = () => {
    if (done) return;
    if (intersectionObserver) {
      processIntersectionEntries(intersectionObserver.takeRecords());
    }
    done = true;
    mutationObserver.disconnect();
    intersectionObserver?.disconnect();
    cancelAnimationFrame(requestId);
    callback(latestRenderTime);
  };

  const beginFinish = () => {
    processMutations(mutationObserver.takeRecords());
    mutationObserver.disconnect();
    if (intersectionObserver && hasObservedTarget) {
      requestId = requestAnimationFrame(finish);
      return;
    }
    finish();
  };

  const waitForPageReady = () => {
    if (done) return;
    if (document.readyState === "complete") {
      beginFinish();
      return;
    }
    requestId = requestAnimationFrame(waitForPageReady);
  };

  mutationObserver.observe(document, {
    childList: true,
    subtree: true,
  });
  waitForPageReady();

  return () => {
    if (done) return;
    done = true;
    mutationObserver.disconnect();
    intersectionObserver?.disconnect();
    cancelAnimationFrame(requestId);
  };
}
