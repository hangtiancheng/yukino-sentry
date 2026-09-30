import { vi } from "vitest";

function normalizeThresholds(
  threshold: number | readonly number[] | undefined,
): readonly number[] {
  if (typeof threshold === "number") {
    return [threshold];
  }
  if (!threshold) {
    return [0];
  }
  return [...threshold];
}

export class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly scrollMargin: string = "";
  readonly thresholds: readonly number[] = [];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  private records: IntersectionObserverEntry[] = [];

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.thresholds = normalizeThresholds(options?.threshold);
    FakeIntersectionObserver.instances.push(this);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return this.records.splice(0);
  }

  emit(
    target: Element,
    isIntersecting: boolean,
    time = performance.now(),
  ): void {
    this.callback([this.createEntry(target, isIntersecting, time)], this);
  }

  queue(
    target: Element,
    isIntersecting: boolean,
    time = performance.now(),
  ): void {
    this.records.push(this.createEntry(target, isIntersecting, time));
  }

  private createEntry(
    target: Element,
    isIntersecting: boolean,
    time: number,
  ): IntersectionObserverEntry {
    return {
      boundingClientRect: new DOMRectReadOnly(),
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: new DOMRectReadOnly(),
      isIntersecting,
      rootBounds: null,
      target,
      time,
    };
  }
}
