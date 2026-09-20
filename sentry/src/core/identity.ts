/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
