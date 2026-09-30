// The report pipeline must stay synchronous all the way to the transport when
// no async hook interferes: an unconditional `await` would defer sendBeacon by
// a microtask, which is exactly what the pagehide flush cannot afford. This
// guard keeps the synchronous fast path while still supporting async hooks.
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
