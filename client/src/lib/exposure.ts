/**
 * Shared ExposurePlugin instance + React hook. The plugin only reports when
 * elements are observed, so dashboard cards opt in via useExposure(); an
 * Exposure event fires each time an observed card scrolls out of the viewport.
 *
 * Implemented as a callback ref (not useRef + effect) so observation follows
 * conditional rendering: cards mounted after the empty/loading state are still
 * observed, and unmounted cards are released.
 */

import { useCallback, useEffect, useRef } from "react";
import { ExposurePlugin } from "@yukino.js/sentry/plugins";

export const exposurePlugin = new ExposurePlugin();

export function useExposure(
  params: Record<string, unknown>,
  threshold = 0.5,
): (node: Element | null) => void {
  const paramsRef = useRef(params);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Keep the latest params available to the next observe() without putting
  // them in the callback's deps (that would detach/re-attach the observer on
  // every render). The useRef initial value covers the mount-time attach,
  // which runs before this effect.
  useEffect(() => {
    paramsRef.current = params;
  });

  return useCallback(
    (node: Element | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      if (node) {
        exposurePlugin.observe({
          target: node,
          threshold,
          params: paramsRef.current,
        });
        cleanupRef.current = () => exposurePlugin.unobserve(node);
      }
    },
    [threshold],
  );
}
