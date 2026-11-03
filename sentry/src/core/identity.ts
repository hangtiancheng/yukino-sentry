import { UNKNOWN } from "../constants";
import { sentry } from "../utils";

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
