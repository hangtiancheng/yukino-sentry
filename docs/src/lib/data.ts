export const VERSION = "0.0.1";

export const REPO_URL = "https://github.com/hangtiancheng/yukino-sentry";

export const NPM_PACKAGE = "@yukino.js/sentry";

export const INSTALL_COMMAND = "npm i @yukino.js/sentry";

export type FeatureId =
  | "errorCapture"
  | "journeyTracking"
  | "webVitals"
  | "whiteScreenReplay"
  | "offlineResilient"
  | "pluginSystem";

export interface Feature {
  readonly id: FeatureId;
  readonly icon: string;
  readonly wide?: boolean;
  readonly accent: "brand" | "green" | "yellow" | "neutral";
  readonly chips: readonly string[];
}

export const FEATURES: readonly Feature[] = [
  {
    id: "errorCapture",
    icon: "bug",
    wide: true,
    accent: "brand",
    chips: ["JS Error", "unhandledrejection", "XHR / Fetch", "React / Vue"],
  },
  {
    id: "journeyTracking",
    icon: "mouse-pointer-click",
    accent: "yellow",
    chips: ["PV", "Click", "Exposure"],
  },
  {
    id: "webVitals",
    icon: "gauge",
    accent: "green",
    chips: ["LCP", "INP", "CLS", "Resource"],
  },
  {
    id: "whiteScreenReplay",
    icon: "scan-eye",
    accent: "brand",
    chips: ["Skeleton", "Record 3s"],
  },
  {
    id: "offlineResilient",
    icon: "wifi",
    accent: "neutral",
    chips: ["Offline Cache", "Auto Retry", "Batch"],
  },
  {
    id: "pluginSystem",
    icon: "plug",
    accent: "brand",
    chips: ["beforeSend", "afterSend", "enablePlugin"],
  },
];

export type WorkflowStepId = "install" | "init" | "insight";

export interface WorkflowStep {
  readonly id: WorkflowStepId;
  readonly step: string;
  readonly icon: string;
  readonly command?: string;
}

export const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    id: "install",
    step: "01",
    icon: "package",
    command: "npm i @yukino.js/sentry",
  },
  {
    id: "init",
    step: "02",
    icon: "wand-sparkles",
    command: 'init({ dsn: "/api/log" })',
  },
  { id: "insight", step: "03", icon: "gauge" },
];

export type FaqId =
  "data" | "size" | "frameworks" | "privacy" | "offline" | "license";

export const FAQ_IDS: readonly FaqId[] = [
  "data",
  "size",
  "frameworks",
  "privacy",
  "offline",
  "license",
];

export type SceneId = "error" | "journey" | "vitals";

export type RowTone = "err" | "warn" | "ok" | "info";

export interface ShowcaseRow {
  readonly icon: string;
  readonly name: string;
  readonly detail: string;
  readonly tone: RowTone;
  readonly wait: number;
}

export interface ShowcaseScene {
  readonly id: SceneId;
  readonly rows: readonly ShowcaseRow[];
}

export const SCENES: readonly ShowcaseScene[] = [
  {
    id: "error",
    rows: [
      {
        icon: "timer",
        name: "pv",
        detail: "/checkout",
        tone: "info",
        wait: 700,
      },
      {
        icon: "mouse-pointer-click",
        name: "click",
        detail: "button[data-submit]",
        tone: "info",
        wait: 800,
      },
      {
        icon: "triangle-alert",
        name: "error",
        detail: "TypeError: cart is undefined",
        tone: "err",
        wait: 1100,
      },
      {
        icon: "route",
        name: "breadcrumb",
        detail: "xhr POST /api/cart · 500",
        tone: "warn",
        wait: 900,
      },
      {
        icon: "send",
        name: "report",
        detail: "queued → /api/log · 200",
        tone: "ok",
        wait: 1000,
      },
    ],
  },
  {
    id: "journey",
    rows: [
      {
        icon: "timer",
        name: "pv",
        detail: "/pricing",
        tone: "info",
        wait: 700,
      },
      {
        icon: "eye",
        name: "exposure",
        detail: "#banner · 0.5s",
        tone: "info",
        wait: 800,
      },
      {
        icon: "mouse-pointer-click",
        name: "click",
        detail: "a[data-plan=pro]",
        tone: "info",
        wait: 800,
      },
      {
        icon: "waypoints",
        name: "custom",
        detail: "traceCustomEvent(sign_up)",
        tone: "warn",
        wait: 900,
      },
      {
        icon: "send",
        name: "report",
        detail: "batched · 200",
        tone: "ok",
        wait: 1000,
      },
    ],
  },
  {
    id: "vitals",
    rows: [
      {
        icon: "activity",
        name: "navigation",
        detail: "SPA · /dashboard",
        tone: "info",
        wait: 700,
      },
      {
        icon: "gauge",
        name: "LCP",
        detail: "1.21s · good",
        tone: "ok",
        wait: 850,
      },
      {
        icon: "zap",
        name: "INP",
        detail: "84ms · good",
        tone: "ok",
        wait: 850,
      },
      {
        icon: "scan-eye",
        name: "CLS",
        detail: "0.02 · good",
        tone: "ok",
        wait: 850,
      },
      {
        icon: "send",
        name: "report",
        detail: "beacon pagehide · 200",
        tone: "ok",
        wait: 1000,
      },
    ],
  },
];

export interface Vital {
  readonly name: string;
  readonly value: string;
  readonly tone: "good" | "warn";
}

export const VITALS: readonly Vital[] = [
  { name: "LCP", value: "1.21s", tone: "good" },
  { name: "INP", value: "84ms", tone: "good" },
  { name: "CLS", value: "0.02", tone: "good" },
  { name: "TTFB", value: "0.4s", tone: "warn" },
];

export const EVENT_BARS: readonly number[] = [
  34, 52, 41, 66, 78, 62, 85, 74, 90, 68, 58, 72,
];
