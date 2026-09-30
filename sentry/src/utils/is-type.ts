import { z } from "zod";
import type { IExtendedErrorEvent } from "../types";

function isHTMLElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isError(err: unknown): err is Error {
  return err instanceof Error;
}

function isErrorEvent(err: unknown): err is ErrorEvent {
  return err instanceof ErrorEvent;
}

/**
 * Target shape of a resource load failure: an element (string localName)
 * carrying a non-empty `src` (<img>, <script>) OR a non-empty `href`
 * (<link>) — resource elements never expose both.
 */
const resourceTargetSchema = z.union([
  z.looseObject({ localName: z.string(), src: z.string().min(1) }),
  z.looseObject({ localName: z.string(), href: z.string().min(1) }),
]);

/**
 * Matches resource load failures. Browsers dispatch a plain `Event` (never an
 * `ErrorEvent`) of type "error" on the failed element. Code errors arrive as
 * `ErrorEvent` and are routed by `isErrorEvent` before this predicate runs.
 */
function isIExtendedErrorEvent(err: unknown): err is IExtendedErrorEvent {
  return (
    err instanceof Event &&
    err.type === "error" &&
    resourceTargetSchema.safeParse(err.target).success
  );
}

export { isHTMLElement, isError, isErrorEvent, isIExtendedErrorEvent };
