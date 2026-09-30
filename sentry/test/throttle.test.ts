import { afterEach, describe, expect, it, vi } from "vitest";

import { throttle } from "@/utils/index.js";

describe("throttle", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not throttle at all when delay is 0", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 0);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("drops calls inside the delay window and allows the next one after it", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.setSystemTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
