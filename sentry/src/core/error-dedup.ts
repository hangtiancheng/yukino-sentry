import { sentry } from "../utils";

/** Runs `report` once per unique error id unless `repeatCodeError` disables deduplication. */
export function reportOncePerError(errorId: string, report: () => void): void {
  if (!sentry.options.repeatCodeError && sentry.codeErrors.has(errorId)) {
    return;
  }
  sentry.codeErrors.add(errorId);
  report();
}
