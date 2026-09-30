import dom2str from "./dom2str.js";

const trackPrefix = "yukino-sentry-";
const reservedKeys = new Set(["msg", "ev", "view"]);

interface DeclarativeClickData {
  readonly ev: string; // yukino-sentry-ev
  readonly msg: string; // yukino-sentry-msg
  readonly triggerPageUrl: string; // yukino-sentry-view
  readonly x: number; // yukino-sentry-view
  readonly y: number; // yukino-sentry-view
  readonly params: Readonly<Record<string, string | null>>;
  readonly elementPath: string;
  readonly triggerTime: number;
}

function getElementPath(target: EventTarget | null): HTMLElement[] {
  if (!(target instanceof HTMLElement)) {
    return [];
  }
  const path: HTMLElement[] = [];
  let current: HTMLElement | null = target;
  while (current) {
    path.push(current);
    current = current.parentElement;
  }
  return path;
}

function getComposedElementPath(event: MouseEvent): HTMLElement[] {
  return event
    .composedPath()
    .filter((node): node is HTMLElement => node instanceof HTMLElement);
}

function hasTrackingAttribute(element: HTMLElement): boolean {
  return (
    element.hasAttribute("yukino-sentry-view") ||
    element.hasAttribute("yukino-sentry-ev") ||
    element.hasAttribute("yukino-sentry-msg")
  );
}

function getNodeTitle(element: HTMLElement | null): string {
  if (!element) {
    return "";
  }
  return element.getAttribute("yukino-sentry-msg") ?? element.title;
}

function getMessage(target: HTMLElement): string {
  const selfTitle = getNodeTitle(target);
  if (selfTitle) {
    return selfTitle;
  }
  const text = target.textContent?.trim();
  return (
    text || target.getAttribute("aria-label") || target.tagName.toLowerCase()
  );
}

function findAttribute(
  path: readonly HTMLElement[],
  attrName: string,
): string | null {
  for (const element of path) {
    const value = element.getAttribute(attrName);
    if (value) {
      return value;
    }
  }
  return null;
}

function getEventId(path: readonly HTMLElement[]): string {
  const explicitEventId = findAttribute(path, "yukino-sentry-ev");
  if (explicitEventId) {
    return explicitEventId;
  }
  const title = findAttribute(path, "title");
  if (title) {
    return title;
  }
  const container = findAttribute(path, "yukino-sentry-view");
  if (container) {
    return container;
  }
  return path[0]?.tagName.toLowerCase() ?? "unknown";
}

function getParams(
  path: readonly HTMLElement[],
): Readonly<Record<string, string | null>> {
  const source = path.find((element) =>
    Array.from(element.attributes).some((attr) =>
      attr.name.startsWith(trackPrefix),
    ),
  );
  if (!source) {
    return {};
  }
  return Array.from(source.attributes).reduce<Record<string, string | null>>(
    (params, attr) => {
      if (!attr.name.startsWith(trackPrefix)) {
        return params;
      }
      const key = attr.name.replace(trackPrefix, "");
      if (!reservedKeys.has(key)) {
        params[key] = attr.value || null;
      }
      return params;
    },
    {},
  );
}

export function getDeclarativeClickData(
  event: MouseEvent,
): DeclarativeClickData | null {
  const path = getComposedElementPath(event);
  const fallbackPath = path.length > 0 ? path : getElementPath(event.target);
  const trackingTarget = fallbackPath.find(hasTrackingAttribute);
  if (!trackingTarget) {
    return null;
  }
  const clickedElement =
    event.target instanceof HTMLElement ? event.target : trackingTarget;
  const { top, left } = clickedElement.getBoundingClientRect();
  const { scrollTop, scrollLeft } = document.documentElement;
  return {
    ev: getEventId(fallbackPath),
    msg: getMessage(trackingTarget),
    triggerPageUrl: location.href,
    x: left + scrollLeft,
    y: top + scrollTop,
    params: getParams(fallbackPath),
    elementPath: dom2str(trackingTarget),
    triggerTime: Date.now(),
  };
}
