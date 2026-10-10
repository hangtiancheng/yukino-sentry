import { useEffect, useState } from "react";
import { ReactErrorBoundary } from "@yukino.js/sentry/react";

const ROLL_INTERVAL_MS = 20_000;

const CRASH_PROBABILITY = 0.04;

const RESET_DELAY_MS = 1_000;

interface CrashingProbeProps {
  shouldCrash: boolean;
}

function CrashingProbe({ shouldCrash }: CrashingProbeProps) {
  if (shouldCrash) {
    throw new Error("Seeded React render crash: probe component exploded");
  }
  return null;
}

export function RandomCrash() {
  const [shouldCrash, setShouldCrash] = useState(false);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < CRASH_PROBABILITY) {
        console.log("[error-seeder] firing: React render crash");
        setShouldCrash(true);
      }
    }, ROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

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
