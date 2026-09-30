interface UnrefTimer {
  unref: () => void;
}

function hasUnref(timer: unknown): timer is UnrefTimer {
  return (
    typeof timer === "object" &&
    timer !== null &&
    "unref" in timer &&
    typeof timer.unref === "function"
  );
}

export function unrefTimer(timer: ReturnType<typeof setTimeout>): void {
  if (hasUnref(timer)) {
    timer.unref();
  }
}
