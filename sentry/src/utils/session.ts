import { generateUUID } from "./uuid.js";

const DEVICE_ID_KEY = "yukino_sentry_device_id";
const SESSION_ID_KEY = "yukino_sentry_session_id";

export function getDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return generateUUID();
  }
}

export function getSessionId(): string {
  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return generateUUID();
  }
}
