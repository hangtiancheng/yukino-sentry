import { UNKNOWN } from "../constants";
import { sentry, sentryLogger } from "../utils";

const anonymousIdKey = "yukino_sentry_anonymous_id";

async function getFingerprintVisitorId(): Promise<string> {
  const fingerprint = await import("@fingerprintjs/fingerprintjs");
  const agent = await fingerprint.default.load();
  const result = await agent.get();
  return result.visitorId;
}

function readStoredAnonymousId(): string {
  try {
    return localStorage.getItem(anonymousIdKey) ?? "";
  } catch {
    return "";
  }
}

function writeStoredAnonymousId(anonymousId: string): void {
  try {
    localStorage.setItem(anonymousIdKey, anonymousId);
  } catch {
    sentryLogger.error("Failed to persist anonymous id");
  }
}

export async function initIdentity(): Promise<void> {
  if (!sentry.options.enableFingerprint) {
    return;
  }

  const storedAnonymousId = readStoredAnonymousId();
  if (storedAnonymousId) {
    sentry.setOptions({ anonymousId: storedAnonymousId });
    return;
  }

  try {
    const anonymousId = await getFingerprintVisitorId();
    writeStoredAnonymousId(anonymousId);
    sentry.setOptions({ anonymousId });
  } catch (err) {
    sentryLogger.error("Failed to collect fingerprint.js visitor id", err);
  }
}

export function setVisitorId(visitorId: string): void {
  sentry.setOptions({ visitorId });
}

export function setUserId(userId: string): void {
  sentry.setOptions({ userId });
}

export function getIdentity() {
  const { anonymousId, visitorId, userId } = sentry.options;
  return {
    anonymousId,
    visitorId,
    userId,
    hasAnonymousId: anonymousId !== UNKNOWN,
    hasVisitorId: visitorId !== UNKNOWN,
  };
}
