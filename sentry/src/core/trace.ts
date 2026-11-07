import type { ITraceContext } from "../types/index.js";
import { isBrowserRuntime } from "../utils/runtime.js";
import sentry from "../utils/sentry.js";

const TRACEPARENT_PATTERN = /^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/;
const ZERO_TRACE_ID = "00000000000000000000000000000000";
const ZERO_SPAN_ID = "0000000000000000";

function randomHex(byteLength: number): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const bytes = cryptoObj.getRandomValues(new Uint8Array(byteLength));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }
  let hex = "";
  for (let i = 0; i < byteLength * 2; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}

export function generateTraceId(): string {
  return randomHex(16);
}

export function generateSpanId(): string {
  return randomHex(8);
}

export function createTraceContext(): ITraceContext {
  return { traceId: generateTraceId(), spanId: generateSpanId() };
}

export function formatTraceparent(traceId: string, spanId: string): string {
  return `00-${traceId}-${spanId}-01`;
}

export function parseTraceparent(
  header: string | undefined,
): ITraceContext | undefined {
  if (typeof header !== "string") return undefined;
  const match = TRACEPARENT_PATTERN.exec(header.trim().toLowerCase());
  if (!match) return undefined;
  const [, traceId, spanId] = match;
  if (traceId === ZERO_TRACE_ID || spanId === ZERO_SPAN_ID) return undefined;
  return { traceId, spanId };
}

let ambientContext = createTraceContext();
let resolveContext: (() => ITraceContext) | undefined;

export function renewTraceContext(): ITraceContext {
  ambientContext = createTraceContext();
  return ambientContext;
}

export function setTraceContextResolver(
  resolver: (() => ITraceContext) | undefined,
): void {
  resolveContext = resolver;
}

export function getTraceContext(): ITraceContext {
  return resolveContext ? resolveContext() : ambientContext;
}

function isSameOriginUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  const location = globalThis.location;
  if (!location) return false;
  try {
    return new URL(url, location.href).origin === location.origin;
  } catch {
    return false;
  }
}

export function shouldPropagateTrace(url: string): boolean {
  const targets = sentry.options.tracePropagationTargets;
  if (targets) {
    return targets.some((target) =>
      typeof target === "string" ? url.includes(target) : target.test(url),
    );
  }
  if (!isBrowserRuntime()) return true;
  return isSameOriginUrl(url);
}
