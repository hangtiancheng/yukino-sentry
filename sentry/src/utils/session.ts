import { generateUUID } from "./uuid.js";
import { isBrowserRuntime } from "./runtime.js";

const DEVICE_ID_KEY = "yukino_sentry_device_id";
const SESSION_ID_KEY = "yukino_sentry_session_id";

let memoryDeviceId: string | undefined;
let memorySessionId: string | undefined;

export function getDeviceId(): string {
  if (!isBrowserRuntime()) {
    memoryDeviceId ??= generateUUID();
    return memoryDeviceId;
  }
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
  if (!isBrowserRuntime()) {
    memorySessionId ??= generateUUID();
    return memorySessionId;
  }
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
