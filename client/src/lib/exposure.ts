import { useCallback, useEffect, useRef } from "react";
import { ExposurePlugin } from "@yukino.js/sentry/plugins";

export const exposurePlugin = new ExposurePlugin();

export function useExposure(
  params: Record<string, unknown>,
  threshold = 0.5,
): (node: Element | null) => void {
  const paramsRef = useRef(params);
  const cleanupRef = useRef<(() => void) | null>(null);

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
