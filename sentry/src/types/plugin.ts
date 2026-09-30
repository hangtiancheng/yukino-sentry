import type { IReportPayload } from "./common.js";

export type WithSentry<T, S extends IReportPayload = IReportPayload> = T & {
  __sentry__: S;
};

export abstract class SentryPlugin {
  abstract init(): void;
  destroy?(): void;
}
