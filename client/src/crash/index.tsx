/**
 * Seed for EventType.React: a component that randomly throws during render.
 *
 * React render errors are NOT visible to the global `window "error"` listener
 * in a useful way — they must be caught by an error boundary. The SDK ships
 * <ReactErrorBoundary>, whose componentDidCatch forwards the error, its stack
 * and React's component-stack info as an EventType.React report.
 *
 * Mechanics:
 *   1. Every ROLL_INTERVAL_MS a probability roll may flip `shouldCrash` on.
 *   2. <CrashingProbe> then throws synchronously during render.
 *   3. The surrounding <ReactErrorBoundary> catches + reports the error and
 *      renders an invisible fallback, so the host app is never disturbed.
 *   4. One second later the boundary is remounted via a changing `key`
 *      (class-based boundaries keep their error state until remount) and the
 *      probe returns to its harmless state, ready for the next roll.
 */

import { useEffect, useState } from "react";
import { ReactErrorBoundary } from "@yukino.js/sentry/react";

/** Interval between crash probability rolls. */
const ROLL_INTERVAL_MS = 20_000;

/** Probability that a single roll triggers a render crash (4%). */
const CRASH_PROBABILITY = 0.04;

/** Delay before the crashed boundary is reset for the next round. */
const RESET_DELAY_MS = 1_000;

interface CrashingProbeProps {
  shouldCrash: boolean;
}

/**
 * Renders nothing while healthy; throws during render when told to crash.
 * The throw happens inside React's render phase, which is exactly the class
 * of error only an ErrorBoundary (and thus EventType.React) can observe.
 */
function CrashingProbe({ shouldCrash }: CrashingProbeProps) {
  if (shouldCrash) {
    // Intentional render-phase crash captured by <ReactErrorBoundary>
    throw new Error("Seeded React render crash: probe component exploded");
  }
  return null;
}

/**
 * Drop-in, visually inert component. Mount once anywhere in the tree to seed
 * probabilistic EventType.React reports.
 */
export function RandomCrash() {
  const [shouldCrash, setShouldCrash] = useState(false);
  // Bumping the epoch remounts the boundary, clearing its sticky error state.
  const [epoch, setEpoch] = useState(0);

  // Roll the dice on a timer; at most one pending crash at a time.
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < CRASH_PROBABILITY) {
        console.log("[error-seeder] firing: React render crash");
        setShouldCrash(true);
      }
    }, ROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // After a crash was caught, schedule a silent reset for the next round.
  useEffect(() => {
    if (!shouldCrash) return;
    const id = setTimeout(() => {
      setShouldCrash(false);
      setEpoch((current) => current + 1);
    }, RESET_DELAY_MS);
    return () => clearTimeout(id);
  }, [shouldCrash]);

  return (
    <ReactErrorBoundary key={epoch} fallback={null}>
      <CrashingProbe shouldCrash={shouldCrash} />
    </ReactErrorBoundary>
  );
}
