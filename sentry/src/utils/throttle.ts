export function throttle<This, Args extends unknown[], Return>(
  fn: (this: This, ...args: Args) => Return,
  delay: number,
): (this: This, ...args: Args) => void {
  if (delay <= 0) {
    return function (this: This, ...args: Args) {
      fn.apply(this, args);
    };
  }

  let latestTimestamp = Number.NEGATIVE_INFINITY;

  return function (this: This, ...args: Args) {
    const now = Date.now();
    if (now - latestTimestamp >= delay) {
      latestTimestamp = now;
      fn.apply(this, args);
    }
  };
}
