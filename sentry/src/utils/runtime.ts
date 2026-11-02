export function isBrowserRuntime(): boolean {
  return typeof window !== "undefined";
}
