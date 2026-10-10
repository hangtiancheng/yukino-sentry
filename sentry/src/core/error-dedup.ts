import { sentry } from "../utils";

export function reportOncePerError(errorId: string, report: () => void): void {
  if (!sentry.options.repeatCodeError && sentry.codeErrors.has(errorId)) {
    return;
  }
  sentry.codeErrors.add(errorId);
  report();
}
