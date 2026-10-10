export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return (
    value instanceof Promise ||
    (value !== null &&
      typeof value === "object" &&
      "then" in value &&
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      typeof (value as Record<string, unknown>).then === "function")
  );
}
