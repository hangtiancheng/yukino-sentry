import {
  MAX_WHITE_SCREEN_SAMPLE_COUNT,
  WHITE_SCREEN_SAMPLE_INTERVAL,
} from "../constants";

import {
  EventType,
  Status,
  type IBaseDataWithEvent,
  type TOnReportWhiteScreenData,
} from "../types";

import { sentry, getCssSelectors, getBaseData, sentryLogger } from "../utils";
import type { Cleanup } from "../utils/decorate-prop.js";

const SAMPLE_X_RATIOS = [0.1, 0.5, 0.9] as const;
const SAMPLE_Y_RATIOS = [0.1, 0.26, 0.42, 0.58, 0.74, 0.9] as const;
const SAMPLE_POINT_COUNT = SAMPLE_X_RATIOS.length * SAMPLE_Y_RATIOS.length;

let sampleTimer: ReturnType<typeof setInterval> | null = null;
let cancelPendingStart: Cleanup | null = null;

export function stopWhiteScreenCheck(): void {
  if (sampleTimer) {
    clearInterval(sampleTimer);
    sampleTimer = null;
  }
  cancelPendingStart?.();
  cancelPendingStart = null;
}

/**
 * Samples viewport points every second after page load. Sampling stops as
 * soon as real content is observed; a white screen is reported only once the
 * page stayed blank (or the skeleton never transitioned) for
 * `MAX_WHITE_SCREEN_SAMPLE_COUNT` consecutive samples.
 */
export function startWhiteScreenCheck(
  onReport: TOnReportWhiteScreenData,
): void {
  const { hasSkeleton, rootCssSelectors } = sentry.options;
  let sampleCount = 0;
  const initialSelectors = new Set<string>();
  const currentSelectors = new Set<string>();

  const isRoot = (elem: Element) => {
    const selectors = getCssSelectors(elem);
    const [idSelector, classSelector, elementSelector] = selectors;
    if (hasSkeleton) {
      const bucket = sampleCount === 1 ? initialSelectors : currentSelectors;
      selectors.forEach((selector) => bucket.add(selector));
    }
    return (
      rootCssSelectors.includes(idSelector) ||
      rootCssSelectors.includes(classSelector) ||
      rootCssSelectors.includes(elementSelector)
    );
  };

  const countEmptyPoints = (): number => {
    const { innerWidth, innerHeight } = globalThis;
    let emptyPoints = 0;
    for (const yRatio of SAMPLE_Y_RATIOS) {
      for (const xRatio of SAMPLE_X_RATIOS) {
        const elem = document.elementFromPoint(
          innerWidth * xRatio,
          innerHeight * yRatio,
        );
        if (!elem || isRoot(elem)) {
          emptyPoints++;
        }
      }
    }
    return emptyPoints;
  };

  const selectorsMatchBaseline = () =>
    Array.from(currentSelectors).sort().join(",") ===
    Array.from(initialSelectors).sort().join(",");

  const sample = () => {
    sampleCount++;
    currentSelectors.clear();
    const isWhiteScreen = countEmptyPoints() === SAMPLE_POINT_COUNT;

    if (hasSkeleton) {
      // The baseline sample records which skeleton selectors are on screen.
      if (sampleCount === 1) return;
      // A selector change means the skeleton transitioned to real content.
      if (!selectorsMatchBaseline()) {
        stopWhiteScreenCheck();
        return;
      }
    } else if (!isWhiteScreen) {
      stopWhiteScreenCheck();
      return;
    }

    if (sampleCount >= MAX_WHITE_SCREEN_SAMPLE_COUNT) {
      report();
    }
  };

  const report = () => {
    const whiteScreenData: IBaseDataWithEvent = {
      ...getBaseData(),
      type: EventType.WhiteScreen,
      status: Status.Error,
      name: "WhiteScreen",
      message: `sample count ${sampleCount}`,
      extra: { sampleCount },
    };
    sentryLogger.error("White screen detected", whiteScreenData);
    onReport(whiteScreenData);
    stopWhiteScreenCheck();
  };

  const loopSample = () => {
    if (sampleTimer) {
      return;
    }
    sampleTimer = globalThis.setInterval(() => {
      if ("requestIdleCallback" in globalThis) {
        requestIdleCallback(
          (deadline) => {
            if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
              sample();
            }
          },
          { timeout: WHITE_SCREEN_SAMPLE_INTERVAL },
        );
      } else {
        sample();
      }
    }, WHITE_SCREEN_SAMPLE_INTERVAL);
  };

  if (document.readyState === "complete") {
    loopSample();
    return;
  }
  globalThis.addEventListener("load", loopSample, { once: true });
  cancelPendingStart = () => {
    globalThis.removeEventListener("load", loopSample);
  };
}
