import reporter from "../reporter/index.js";
import { EventType, Status } from "../types/index.js";
import { getBaseData } from "../utils/index.js";

interface FrameworkErrorInput {
  readonly type: EventType.React | EventType.Vue | EventType.OtherFrameworks;
  readonly error: unknown;
  readonly context: unknown;
}

function getErrorName(error: unknown): string {
  if (error instanceof Error) return error.name;
  if (error === null) return "null";
  if (error === undefined) return "undefined";
  if (typeof error === "object") {
    const proto = Object.getPrototypeOf(error);
    const ctorName = proto?.constructor?.name;
    return ctorName ?? "Object";
  }
  return typeof error;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error === null) return "null";
  if (error === undefined) return "undefined";
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  if (error !== null && typeof error === "object") {
    const stack = Reflect.get(error, "stack");
    return typeof stack === "string" ? stack : undefined;
  }
  return undefined;
}

export function reportFrameworkError(input: FrameworkErrorInput): void {
  reporter.send({
    ...getBaseData(),
    type: input.type,
    name: getErrorName(input.error),
    message: getErrorMessage(input.error),
    status: Status.Error,
    extra: {
      error: input.error,
      stack: getErrorStack(input.error),
      context: input.context,
    },
  });
}
