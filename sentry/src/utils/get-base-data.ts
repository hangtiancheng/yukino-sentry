import { EventType, Status, type IReportPayload } from "../types";
import { getTraceContext } from "../core/trace.js";
import { getDeviceId, getSessionId } from "./session.js";
import { generateUUID } from "./uuid.js";

function getBaseData(): IReportPayload {
  return {
    id: generateUUID(),
    deviceId: getDeviceId(),
    sessionId: getSessionId(),
    traceId: getTraceContext().traceId,
    message: "",
    timestamp: Date.now(),
    time: new Date().toISOString(),
    name: "",
    status: Status.OK,
    type: EventType.Custom,
  };
}

export default getBaseData;
