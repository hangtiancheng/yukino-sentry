import { EventType, Status } from "../types";
import { getBaseData } from "../utils";
import reporter from "../reporter/index.js";

const minimumDwellTime = 100;

interface PageState {
  readonly url: string;
  readonly referrer: string;
  readonly startedAt: number;
  readonly name: string;
}

let currentPage: PageState | null = null;

function getCurrentUrl(): string {
  return globalThis.location?.href ?? "";
}

function sendPageView(page: PageState, immediate: boolean): void {
  reporter.send(
    {
      ...getBaseData(),
      type: EventType.PV,
      name: page.name,
      message: page.url,
      status: Status.OK,
      extra: {
        url: page.url,
        referrer: page.referrer,
        entryTime: page.startedAt,
      },
    },
    immediate,
  );
}

function sendDwellTime(
  page: PageState,
  duration: number,
  immediate: boolean,
): void {
  if (duration <= minimumDwellTime) {
    return;
  }
  reporter.send(
    {
      ...getBaseData(),
      type: EventType.PV,
      name: "PageDwell",
      message: page.url,
      status: Status.OK,
      extra: {
        url: page.url,
        referrer: page.referrer,
        duration,
      },
    },
    immediate,
  );
}

function createPageState(
  url: string,
  referrer: string,
  name: string,
): PageState {
  return {
    url,
    referrer,
    name,
    startedAt: Date.now(),
  };
}

export function initPageView(): void {
  currentPage = createPageState(
    getCurrentUrl(),
    globalThis.document?.referrer ?? "",
    "PageLoad",
  );
  sendPageView(currentPage, true);
}

export function recordRoutePageView(
  to: string,
  from: string,
  name: string,
): void {
  const baseUrl = globalThis.location.href;
  const normalizedTo = new URL(to, baseUrl).href;
  const normalizedFrom = new URL(from, baseUrl).href;
  if (currentPage?.url === normalizedTo) {
    return;
  }
  if (currentPage) {
    sendDwellTime(currentPage, Date.now() - currentPage.startedAt, false);
  }
  currentPage = createPageState(normalizedTo, normalizedFrom, name);
  sendPageView(currentPage, false);
}

export function flushCurrentPageDwell(immediate: boolean): void {
  if (!currentPage) {
    return;
  }
  sendDwellTime(currentPage, Date.now() - currentPage.startedAt, immediate);
}

export function resetPageView(): void {
  currentPage = null;
}
