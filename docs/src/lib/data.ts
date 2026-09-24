export type FeatureId =
  | "errorCapture"
  | "httpCapture"
  | "webVitals"
  | "navigationTiming"
  | "pageViews"
  | "declarativeClicks"
  | "exposure"
  | "whiteScreen"
  | "screenRecording"
  | "offlineReporting"
  | "breadcrumbs"
  | "visitorIdentity"
  | "reporterHooks"
  | "pluginSystem"
  | "reactVue"
  | "devSourceMaps";

export interface Feature {
  readonly id: FeatureId;
  readonly icon: string;
}

export const FEATURES: readonly Feature[] = [
  { id: "errorCapture", icon: "bug" },
  { id: "httpCapture", icon: "globe" },
  { id: "webVitals", icon: "gauge" },
  { id: "navigationTiming", icon: "activity" },
  { id: "pageViews", icon: "timer" },
  { id: "declarativeClicks", icon: "mouse-pointer-click" },
  { id: "exposure", icon: "eye" },
  { id: "whiteScreen", icon: "scan-eye" },
  { id: "screenRecording", icon: "camera" },
  { id: "offlineReporting", icon: "wifi" },
  { id: "breadcrumbs", icon: "route" },
  { id: "visitorIdentity", icon: "fingerprint" },
  { id: "reporterHooks", icon: "plug" },
  { id: "pluginSystem", icon: "boxes" },
  { id: "reactVue", icon: "layers" },
  { id: "devSourceMaps", icon: "file-code" },
];

export interface OptionRow {
  readonly name: string;
  readonly type: string;
  readonly value: string;
}

export type OptionGroupKey =
  | "group1Title"
  | "group2Title"
  | "group3Title"
  | "group4Title"
  | "group1Blurb"
  | "group2Blurb"
  | "group3Blurb"
  | "group4Blurb";

export interface OptionGroup {
  readonly id: string;
  readonly titleKey: Extract<OptionGroupKey, `${string}Title`>;
  readonly blurbKey: Extract<OptionGroupKey, `${string}Blurb`>;
  readonly rows: readonly OptionRow[];
}

export const OPTION_GROUPS: readonly OptionGroup[] = [
  {
    id: "essentials",
    titleKey: "group1Title",
    blurbKey: "group1Blurb",
    rows: [
      { name: "dsn", type: "string", value: '""' },
      { name: "projectId", type: "string", value: '"unknown"' },
      { name: "userId", type: "string", value: '"unknown"' },
      { name: "disabled", type: "boolean", value: "false" },
      { name: "debug", type: "boolean", value: "false" },
    ],
  },
  {
    id: "switches",
    titleKey: "group2Title",
    blurbKey: "group2Blurb",
    rows: [
      { name: "enableError", type: "boolean", value: "true" },
      { name: "enableXhr", type: "boolean", value: "true" },
      { name: "enableFetch", type: "boolean", value: "true" },
      { name: "enableClick", type: "boolean", value: "true" },
      { name: "enableUnhandledRejection", type: "boolean", value: "true" },
      { name: "enableHistory", type: "boolean", value: "true" },
      { name: "enableHashChange", type: "boolean", value: "true" },
      { name: "enableWhiteScreen", type: "boolean", value: "true" },
      { name: "enableFingerprint", type: "boolean", value: "false" },
      { name: "enableHttpPerformance", type: "boolean", value: "false" },
      { name: "repeatCodeError", type: "boolean", value: "false" },
    ],
  },
  {
    id: "tuning",
    titleKey: "group3Title",
    blurbKey: "group3Blurb",
    rows: [
      { name: "tracesSampleRate", type: "number", value: "1" },
      { name: "maxBreadcrumbs", type: "number", value: "30" },
      { name: "cacheMaxLength", type: "number", value: "10" },
      { name: "cacheWaitingTime", type: "number", value: "2000" },
      { name: "maxQueueLength", type: "number", value: "200" },
      { name: "retryIntervalMilliseconds", type: "number", value: "60000" },
      { name: "screenRecordDurationMs", type: "number", value: "3000" },
      { name: "clickThrottleDelay", type: "number", value: "0" },
      { name: "hasSkeleton", type: "boolean", value: "false" },
      {
        name: "rootCssSelectors",
        type: "string[]",
        value: '["html","body","#app","#root"]',
      },
      { name: "ignoreErrors", type: "(string | RegExp)[]", value: "[]" },
      { name: "excludeAPIs", type: "(string | RegExp)[]", value: "[]" },
    ],
  },
  {
    id: "storage",
    titleKey: "group4Title",
    blurbKey: "group4Blurb",
    rows: [
      { name: "beforeSend", type: "function", value: "undefined" },
      { name: "beforeSendBatch", type: "function", value: "undefined" },
      { name: "afterSend", type: "function", value: "undefined" },
      { name: "beforeBreadcrumb", type: "function", value: "undefined" },
      {
        name: "offlineCacheKey",
        type: "string",
        value: '"yukino_sentry_offline_cache"',
      },
    ],
  },
];

export type ApiId =
  | "init"
  | "destroy"
  | "isInitialized"
  | "enablePlugin"
  | "traceError"
  | "tracePerformance"
  | "traceCustomEvent"
  | "tracePageView"
  | "reportFrameworkError"
  | "setUserId"
  | "setVisitorId"
  | "flushOfflineCache"
  | "hooks"
  | "getIdentity";

export interface ApiItem {
  readonly id: ApiId;
  readonly name: string;
  readonly signature: string;
  readonly icon: string;
}

export const API_ITEMS: readonly ApiItem[] = [
  {
    id: "init",
    name: "init",
    signature: "init(options: InitOptions): void",
    icon: "sparkles",
  },
  {
    id: "destroy",
    name: "destroy",
    signature: "destroy(): void",
    icon: "shield-check",
  },
  {
    id: "isInitialized",
    name: "isInitialized",
    signature: "isInitialized(): boolean",
    icon: "radio",
  },
  {
    id: "enablePlugin",
    name: "enablePlugin",
    signature: "enablePlugin(...plugins: SentryPlugin[]): void",
    icon: "plug",
  },
  {
    id: "traceError",
    name: "traceError",
    signature: "traceError(error: unknown): void",
    icon: "bug",
  },
  {
    id: "tracePerformance",
    name: "tracePerformance",
    signature: "tracePerformance({ name, message, value }): void",
    icon: "gauge",
  },
  {
    id: "traceCustomEvent",
    name: "traceCustomEvent",
    signature: "traceCustomEvent({ name, message, extra? }): void",
    icon: "waypoints",
  },
  {
    id: "tracePageView",
    name: "tracePageView",
    signature: "tracePageView({ name?, message?, extra? }): void",
    icon: "timer",
  },
  {
    id: "reportFrameworkError",
    name: "reportFrameworkError",
    signature: "reportFrameworkError({ type, error, context }): void",
    icon: "layers",
  },
  {
    id: "setUserId",
    name: "setUserId",
    signature: "setUserId(userId: string): void",
    icon: "fingerprint",
  },
  {
    id: "setVisitorId",
    name: "setVisitorId",
    signature: "setVisitorId(visitorId: string): void",
    icon: "database",
  },
  {
    id: "flushOfflineCache",
    name: "flushOfflineCache",
    signature: "flushOfflineCache(): Promise<void>",
    icon: "wifi",
  },
  {
    id: "hooks",
    name: "beforeSend / afterSend",
    signature: "beforeSend(hook) · beforeSendBatch(hook) · afterSend(hook)",
    icon: "braces",
  },
  {
    id: "getIdentity",
    name: "getIdentity",
    signature: "getIdentity(): Identity",
    icon: "network",
  },
];

export type EventTypeId =
  | "error"
  | "fetch"
  | "xhr"
  | "resource"
  | "unhandledRejection"
  | "click"
  | "hashChange"
  | "history"
  | "vue"
  | "react"
  | "otherFrameworks"
  | "performance"
  | "screenRecord"
  | "exposure"
  | "whiteScreen"
  | "custom"
  | "pv";

export interface EventTypeRow {
  readonly id: EventTypeId;
  readonly value: string;
  readonly label: string;
}

export const EVENT_TYPES: readonly EventTypeRow[] = [
  { id: "error", value: "Error", label: "Error" },
  { id: "fetch", value: "fetch", label: "Fetch" },
  { id: "xhr", value: "XMLHttpRequest", label: "Xhr" },
  { id: "resource", value: "Resource", label: "Resource" },
  {
    id: "unhandledRejection",
    value: "Event unhandledrejection",
    label: "UnhandledRejection",
  },
  { id: "click", value: "Click", label: "Click" },
  { id: "hashChange", value: "Event hashchange", label: "HashChange" },
  { id: "history", value: "History", label: "History" },
  { id: "vue", value: "Vue", label: "Vue" },
  { id: "react", value: "React", label: "React" },
  { id: "otherFrameworks", value: "OtherFrameworks", label: "OtherFrameworks" },
  { id: "performance", value: "Performance", label: "Performance" },
  { id: "screenRecord", value: "ScreenRecord", label: "ScreenRecord" },
  { id: "exposure", value: "Exposure", label: "Exposure" },
  { id: "whiteScreen", value: "WhiteScreen", label: "WhiteScreen" },
  { id: "custom", value: "Custom", label: "Custom" },
  { id: "pv", value: "PV", label: "PV" },
];
