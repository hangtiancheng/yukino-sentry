import { unrefTimer } from "./timer.js";

export function scheduleFlush(
  previousTimer: ReturnType<typeof setTimeout> | undefined,
  delay: number,
  flush: () => Promise<void>,
): ReturnType<typeof setTimeout> {
  if (previousTimer) clearTimeout(previousTimer);
  const nextTimer = setTimeout(() => void flush(), delay);
  unrefTimer(nextTimer);
  return nextTimer;
}
