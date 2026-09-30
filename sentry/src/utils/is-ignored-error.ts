import sentry from "./sentry.js";

function matchesPattern(value: string, pattern: string | RegExp): boolean {
  if (typeof pattern === "string") {
    return value.includes(pattern);
  }
  return pattern.test(value);
}

export default function isIgnoredError(message: string): boolean {
  return sentry.options.ignoreErrors.some((pattern) =>
    matchesPattern(message, pattern),
  );
}
