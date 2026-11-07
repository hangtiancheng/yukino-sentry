import { AsyncLocalStorage } from "node:async_hooks";

import {
  createTraceContext,
  formatTraceparent,
  generateSpanId,
  parseTraceparent,
  setTraceContextResolver,
} from "../core/trace.js";
import type { ITraceContext } from "../types/index.js";
import type { Cleanup } from "../utils/decorate-prop.js";

export type TraceparentSource = string | string[] | null | undefined;

const traceStorage = new AsyncLocalStorage<ITraceContext>();

function normalizeTraceparent(source: TraceparentSource): string | undefined {
  if (Array.isArray(source)) return source[0];
  return source ?? undefined;
}

export function continueTrace<T>(
  traceparent: TraceparentSource,
  callback: (context: ITraceContext) => T,
): T {
  const inherited = parseTraceparent(normalizeTraceparent(traceparent));
  const context: ITraceContext = inherited
    ? { traceId: inherited.traceId, spanId: generateSpanId() }
    : createTraceContext();
  return traceStorage.run(context, () => callback(context));
}

export function getActiveTraceContext(): ITraceContext | undefined {
  return traceStorage.getStore();
}

export function getTraceparent(): string | undefined {
  const context = traceStorage.getStore();
  if (!context) return undefined;
  return formatTraceparent(context.traceId, context.spanId);
}

export function installNodeTraceContext(): Cleanup {
  setTraceContextResolver(
    () => traceStorage.getStore() ?? createTraceContext(),
  );
  return () => setTraceContextResolver(undefined);
}
