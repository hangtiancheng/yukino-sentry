import type { TReportPayload } from "./common.js";

import type { EventType } from "./enums.js";
import type { Cleanup } from "../utils/decorate-prop.js";

export type TEventHandler<T extends TReportPayload = TReportPayload> = {
  handle(data: T): void;
}["handle"];

export type IPub = (type: EventType, param: TReportPayload) => void;

export type ISub = <T extends TReportPayload>(
  type: EventType,
  handler: TEventHandler<T>,
) => Cleanup;
