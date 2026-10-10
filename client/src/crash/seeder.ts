import { traceError } from "@yukino.js/sentry";

const TICK_INTERVAL_MS = 15_000;

const FIRST_TICK_DELAY_MS = 5_000;

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function seedUncaughtTypeError(): void {
  setTimeout(() => {
    const brokenUser: { profile: { name: string } } = JSON.parse("null");
    console.log(brokenUser.profile.name);
  }, 0);
}

function seedUncaughtReferenceError(): void {
  setTimeout(() => {
    const missingFn: () => void = Reflect.get(
      globalThis,
      "__definitelyMissingFn__",
    );
    missingFn();
  }, 0);
}

function seedUnhandledRejection(): void {
  void new Promise<never>((_, reject) => {
    reject(new Error("Seeded unhandled rejection: async task failed"));
  });
}

function seedResourceError(): void {
  const img = document.createElement("img");
  img.style.display = "none";
  img.src = `/static/__seeded_missing_${Date.now()}.png`;
  img.addEventListener("error", () => img.remove(), { once: true });
  document.body.appendChild(img);
}

function seedHttpNotFound(): void {
  fetch("/api/__seeded_missing_endpoint__").catch(() => {});
}

function seedNetworkError(): void {
  fetch("http://127.0.0.1:1/__seeded_unreachable__").catch(() => {});
}

function seedConsoleError(): void {
  console.error(
    new Error("Seeded console.error: recoverable subsystem failure"),
  );
}

function seedManualTraceError(): void {
  try {
    throw new RangeError("Seeded manual report: order quantity out of range");
  } catch (error) {
    traceError(error);
  }
}

function seedBatchErrorBurst(): void {
  const message = "Seeded batch burst: repeated pipeline failure";
  setTimeout(() => {
    throw new Error(message);
  }, 0);
  setTimeout(() => {
    throw new Error(message);
  }, 50);
  setTimeout(() => {
    throw new Error(message);
  }, 100);
  setTimeout(() => {
    throw new Error(message);
  }, 150);
  setTimeout(() => {
    throw new Error(message);
  }, 200);
  setTimeout(() => {
    throw new Error(message);
  }, 250);
}

function seedXhrNotFound(): void {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/api/__seeded_missing_xhr_endpoint__");
  xhr.send();
}

interface ErrorSeed {
  probability: number;
  label: string;
  trigger: () => void;
}

const SEEDS: readonly ErrorSeed[] = [
  {
    probability: 0.08,
    label: "uncaught TypeError",
    trigger: seedUncaughtTypeError,
  },
  {
    probability: 0.06,
    label: "uncaught ReferenceError",
    trigger: seedUncaughtReferenceError,
  },
  {
    probability: 0.08,
    label: "unhandled rejection",
    trigger: seedUnhandledRejection,
  },
  {
    probability: 0.06,
    label: "resource load error",
    trigger: seedResourceError,
  },
  { probability: 0.08, label: "fetch HTTP 404", trigger: seedHttpNotFound },
  {
    probability: 0.04,
    label: "fetch network failure",
    trigger: seedNetworkError,
  },
  {
    probability: 0.06,
    label: "console.error report",
    trigger: seedConsoleError,
  },
  {
    probability: 0.05,
    label: "manual traceError",
    trigger: seedManualTraceError,
  },
  {
    probability: 0.03,
    label: "batch error burst",
    trigger: seedBatchErrorBurst,
  },
  {
    probability: 0.06,
    label: "XHR HTTP 404",
    trigger: seedXhrNotFound,
  },
];

let timerId: ReturnType<typeof setInterval> | undefined;

export function startErrorSeeder(): void {
  if (timerId !== undefined) return;

  const tick = () => {
    for (const seed of SEEDS) {
      if (chance(seed.probability)) {
        console.log(`[error-seeder] firing: ${seed.label}`);
        seed.trigger();
      }
    }
  };

  setTimeout(() => {
    tick();
    timerId = setInterval(tick, TICK_INTERVAL_MS);
  }, FIRST_TICK_DELAY_MS);
}

export function stopErrorSeeder(): void {
  if (timerId !== undefined) {
    clearInterval(timerId);
    timerId = undefined;
  }
}
