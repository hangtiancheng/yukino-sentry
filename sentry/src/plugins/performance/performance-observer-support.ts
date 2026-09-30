export function supportsPerformanceEntryType(entryType: string): boolean {
  if (
    !("PerformanceObserver" in globalThis) ||
    typeof globalThis.PerformanceObserver !== "function"
  ) {
    return false;
  }
  return globalThis.PerformanceObserver.supportedEntryTypes.includes(entryType);
}
