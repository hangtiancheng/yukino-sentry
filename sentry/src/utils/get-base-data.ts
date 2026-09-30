import { EventType, Status, type IReportPayload } from "../types";
import { getDeviceId, getSessionId } from "./session.js";
import { generateUUID } from "./uuid.js";

function getBaseData(): IReportPayload {
  return {
    id: generateUUID(),
    deviceId: getDeviceId(),
    sessionId: getSessionId(),
    message: "",
    timestamp: Date.now(),
    time: new Date().toISOString(),
    name: "",
    status: Status.OK,
    type: EventType.Custom,
  };
}

export default getBaseData;
