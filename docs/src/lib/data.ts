export interface Feature {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly tag: string;
}

export const FEATURES: readonly Feature[] = [
  {
    icon: "bug",
    title: "Error capture",
    description:
      "Runtime errors, console.error, resource load failures and unhandled rejections are classified, deduplicated and batched automatically.",
    tag: "Errors",
  },
  {
    icon: "globe",
    title: "HTTP capture",
    description:
      "XHR and fetch are instrumented with status classification, server-timing parsing and 8 KB body capture on failures only.",
    tag: "Network",
  },
  {
    icon: "gauge",
    title: "Web Vitals",
    description:
      "LCP, FCP, CLS, INP and TTFB alongside a custom First Screen Paint metric measured from real DOM mutations.",
    tag: "Performance",
  },
  {
    icon: "activity",
    title: "Navigation timing",
    description:
      "DNS, TLS, TTFB, DOM processing, resource load and redirect breakdowns from the Navigation Timing API.",
    tag: "Performance",
  },
  {
    icon: "timer",
    title: "Page views & dwell",
    description:
      "Automatic PageLoad, route-change PVs and dwell time flushed on pagehide so mobile sessions are never lost.",
    tag: "Analytics",
  },
  {
    icon: "mouse-pointer-click",
    title: "Declarative clicks",
    description:
      "Zero-code click tracking through yukino-sentry-* attributes with params, element path and viewport coordinates.",
    tag: "Analytics",
  },
  {
    icon: "eye",
    title: "Exposure tracking",
    description:
      "Measure how long any element stays visible with IntersectionObserver thresholds and custom params per target.",
    tag: "Analytics",
  },
  {
    icon: "scan-eye",
    title: "White-screen detection",
    description:
      "18-point viewport sampling plus a skeleton-screen baseline mode catches blank pages before users report them.",
    tag: "Quality",
  },
  {
    icon: "camera",
    title: "Screen recording",
    description:
      "A gzipped rrweb rolling window is attached to the errors and requests you care about, decodable with one helper.",
    tag: "Diagnostics",
  },
  {
    icon: "wifi",
    title: "Offline reporting",
    description:
      "Events queue in localStorage, ship with sendBeacon and recover with an exponential backoff health probe.",
    tag: "Reliability",
  },
  {
    icon: "route",
    title: "Breadcrumbs",
    description:
      "A bounded trail of HTTP, click, route, resource and code events attached to every error-class report.",
    tag: "Diagnostics",
  },
  {
    icon: "fingerprint",
    title: "Visitor identity",
    description:
      "Anonymous visitor ids, persistent device ids and per-tab session ids resolve users across refreshes.",
    tag: "Identity",
  },
  {
    icon: "plug",
    title: "Reporter hooks",
    description:
      "beforeSend, beforeSendBatch and afterSend let you redact, filter or enrich every event before it leaves the browser.",
    tag: "Control",
  },
  {
    icon: "boxes",
    title: "Plugin system",
    description:
      "Extend the core with any SentryPlugin implementation — everything is tree-shakeable and framework free.",
    tag: "Extensible",
  },
  {
    icon: "layers",
    title: "React & Vue",
    description:
      "A React ErrorBoundary and a Vue 3 plugin are published as dedicated subpath exports so nothing extra is bundled.",
    tag: "Frameworks",
  },
  {
    icon: "file-code",
    title: "Dev-time source maps",
    description:
      "Vite and webpack dev-server plugins resolve reported stacks back to original source with inline snippets.",
    tag: "DX",
  },
];

export interface OptionRow {
  readonly name: string;
  readonly type: string;
  readonly value: string;
  readonly description: string;
}

export interface OptionGroup {
  readonly title: string;
  readonly blurb: string;
  readonly rows: readonly OptionRow[];
}

export const OPTION_GROUPS: readonly OptionGroup[] = [
  {
    title: "Essentials",
    blurb: "Everything you need to get a project reporting.",
    rows: [
      {
        name: "dsn",
        type: "string",
        value: '""',
        description: "Report endpoint. Must be non-empty for init to succeed.",
      },
      {
        name: "projectId",
        type: "string",
        value: '"unknown"',
        description: "Frontend project identifier attached to every event.",
      },
      {
        name: "userId",
        type: "string",
        value: '"unknown"',
        description: "Current user identifier, updatable with setUserId().",
      },
      {
        name: "disabled",
        type: "boolean",
        value: "false",
        description: "Apply options but skip all listeners and reporting.",
      },
      {
        name: "debug",
        type: "boolean",
        value: "false",
        description: "Stream styled SDK activity to the console at runtime.",
      },
    ],
  },
  {
    title: "Capture switches",
    blurb: "Turn individual capture layers on or off at init time.",
    rows: [
      {
        name: "enableError",
        type: "boolean",
        value: "true",
        description: "Runtime, console.error and resource error capture.",
      },
      {
        name: "enableXhr",
        type: "boolean",
        value: "true",
        description: "Instrument XMLHttpRequest open/send.",
      },
      {
        name: "enableFetch",
        type: "boolean",
        value: "true",
        description: "Instrument the global fetch function.",
      },
      {
        name: "enableClick",
        type: "boolean",
        value: "true",
        description: "Declarative yukino-sentry-* click tracking.",
      },
      {
        name: "enableUnhandledRejection",
        type: "boolean",
        value: "true",
        description: "Capture unhandled promise rejections.",
      },
      {
        name: "enableHistory",
        type: "boolean",
        value: "true",
        description: "Capture pushState, replaceState and popstate.",
      },
      {
        name: "enableHashChange",
        type: "boolean",
        value: "true",
        description: "Capture hash navigation.",
      },
      {
        name: "enableWhiteScreen",
        type: "boolean",
        value: "true",
        description: "Sample the viewport for blank pages after load.",
      },
      {
        name: "enableFingerprint",
        type: "boolean",
        value: "false",
        description: "Resolve an anonymous visitor id with FingerprintJS.",
      },
      {
        name: "enableHttpPerformance",
        type: "boolean",
        value: "false",
        description: "Report successful requests as performance events.",
      },
      {
        name: "repeatCodeError",
        type: "boolean",
        value: "false",
        description: "Report duplicate code errors instead of deduplicating.",
      },
    ],
  },
  {
    title: "Tuning",
    blurb: "Sampling, batching, retry and detection behaviour.",
    rows: [
      {
        name: "tracesSampleRate",
        type: "number",
        value: "1",
        description: "Sampling rate between 0 and 1 applied to every payload.",
      },
      {
        name: "maxBreadcrumbs",
        type: "number",
        value: "30",
        description: "FIFO capacity of the breadcrumb buffer.",
      },
      {
        name: "cacheMaxLength",
        type: "number",
        value: "10",
        description: "Maximum batch size before an immediate flush.",
      },
      {
        name: "cacheWaitingTime",
        type: "number",
        value: "2000",
        description: "Batch wait window in milliseconds.",
      },
      {
        name: "maxQueueLength",
        type: "number",
        value: "200",
        description: "Maximum queued events while offline or retrying.",
      },
      {
        name: "retryIntervalMilliseconds",
        type: "number",
        value: "60000",
        description: "Cap for the exponential server-recovery probe.",
      },
      {
        name: "screenRecordDurationMs",
        type: "number",
        value: "3000",
        description: "Rolling rrweb window length in milliseconds.",
      },
      {
        name: "clickThrottleDelay",
        type: "number",
        value: "0",
        description: "Throttle window for click capture; 0 disables it.",
      },
      {
        name: "hasSkeleton",
        type: "boolean",
        value: "false",
        description: "Compare samples against a skeleton baseline.",
      },
      {
        name: "rootCssSelectors",
        type: "string[]",
        value: '["html","body","#app","#root"]',
        description:
          "Selectors treated as empty during white-screen detection.",
      },
      {
        name: "ignoreErrors",
        type: "(string | RegExp)[]",
        value: "[]",
        description: "Message substrings or patterns that skip reporting.",
      },
      {
        name: "excludeAPIs",
        type: "(string | RegExp)[]",
        value: "[]",
        description: "Exact URLs or patterns excluded from HTTP capture.",
      },
    ],
  },
  {
    title: "Hooks & storage",
    blurb: "Transform reports and control where the offline queue lives.",
    rows: [
      {
        name: "beforeSend",
        type: "function",
        value: "undefined",
        description: "Transform or drop a single event before queueing.",
      },
      {
        name: "beforeSendBatch",
        type: "function",
        value: "undefined",
        description: "Filter or rewrite a batch before transport.",
      },
      {
        name: "afterSend",
        type: "function",
        value: "undefined",
        description: "Observe batches after a successful transport.",
      },
      {
        name: "beforeBreadcrumb",
        type: "function",
        value: "undefined",
        description:
          "Synchronously transform a breadcrumb before it is stored.",
      },
      {
        name: "offlineCacheKey",
        type: "string",
        value: '"yukino_sentry_offline_cache"',
        description: "localStorage key used for the offline queue.",
      },
    ],
  },
];

export interface ApiItem {
  readonly name: string;
  readonly signature: string;
  readonly description: string;
  readonly icon: string;
}

export const API_ITEMS: readonly ApiItem[] = [
  {
    name: "init",
    signature: "init(options: InitOptions): void",
    description:
      "Validates options with zod, writes runtime config and installs every enabled capture layer.",
    icon: "sparkles",
  },
  {
    name: "destroy",
    signature: "destroy(): void",
    description:
      "Restores decorated globals, tears down plugins and resets all session state.",
    icon: "shield-check",
  },
  {
    name: "isInitialized",
    signature: "isInitialized(): boolean",
    description:
      "Returns true once setup has completed and false after destroy.",
    icon: "radio",
  },
  {
    name: "enablePlugin",
    signature: "enablePlugin(...plugins: SentryPlugin[]): void",
    description: "Initializes and registers any number of plugin instances.",
    icon: "plug",
  },
  {
    name: "traceError",
    signature: "traceError(error: unknown): void",
    description:
      "Routes an error through the full classification pipeline manually.",
    icon: "bug",
  },
  {
    name: "tracePerformance",
    signature: "tracePerformance({ name, message, value }): void",
    description: "Report a custom performance metric as an OK event.",
    icon: "gauge",
  },
  {
    name: "traceCustomEvent",
    signature: "traceCustomEvent({ name, message, extra? }): void",
    description: "Emit an arbitrary business event with optional context.",
    icon: "waypoints",
  },
  {
    name: "tracePageView",
    signature: "tracePageView({ name?, message?, extra? }): void",
    description: "Manually record a page view, useful for virtual routes.",
    icon: "timer",
  },
  {
    name: "reportFrameworkError",
    signature: "reportFrameworkError({ type, error, context }): void",
    description:
      "Report React, Vue or any other framework error with explicit context.",
    icon: "layers",
  },
  {
    name: "setUserId",
    signature: "setUserId(userId: string): void",
    description: "Attach the current user id to subsequent reports.",
    icon: "fingerprint",
  },
  {
    name: "setVisitorId",
    signature: "setVisitorId(visitorId: string): void",
    description: "Bind a backend-known visitor id to the session.",
    icon: "database",
  },
  {
    name: "flushOfflineCache",
    signature: "flushOfflineCache(): Promise<void>",
    description: "Load the persisted queue and attempt to send it now.",
    icon: "wifi",
  },
  {
    name: "beforeSend / afterSend",
    signature: "beforeSend(hook) · beforeSendBatch(hook) · afterSend(hook)",
    description: "Register reporter hooks programmatically after init.",
    icon: "braces",
  },
  {
    name: "getIdentity",
    signature: "getIdentity(): Identity",
    description:
      "Read anonymousId, visitorId, userId and their presence flags.",
    icon: "network",
  },
];

export interface EventTypeRow {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}

export const EVENT_TYPES: readonly EventTypeRow[] = [
  { value: "Error", label: "Error", description: "JavaScript runtime error." },
  {
    value: "fetch",
    label: "Fetch",
    description: "Instrumented fetch request.",
  },
  {
    value: "XMLHttpRequest",
    label: "Xhr",
    description: "Instrumented XMLHttpRequest.",
  },
  {
    value: "Resource",
    label: "Resource",
    description: "Static resource load failure.",
  },
  {
    value: "Event unhandledrejection",
    label: "UnhandledRejection",
    description: "Unhandled promise rejection.",
  },
  {
    value: "Click",
    label: "Click",
    description: "Declarative click event.",
  },
  {
    value: "Event hashchange",
    label: "HashChange",
    description: "Hash navigation.",
  },
  { value: "History", label: "History", description: "History navigation." },
  { value: "Vue", label: "Vue", description: "Vue error handled by the app." },
  { value: "React", label: "React", description: "React ErrorBoundary error." },
  {
    value: "OtherFrameworks",
    label: "OtherFrameworks",
    description: "Any other framework reported manually.",
  },
  {
    value: "Performance",
    label: "Performance",
    description: "Performance metric.",
  },
  {
    value: "ScreenRecord",
    label: "ScreenRecord",
    description: "Compressed rrweb session window.",
  },
  {
    value: "Exposure",
    label: "Exposure",
    description: "Element visibility duration.",
  },
  {
    value: "WhiteScreen",
    label: "WhiteScreen",
    description: "Blank viewport detected after load.",
  },
  { value: "Custom", label: "Custom", description: "Custom business event." },
  {
    value: "PV",
    label: "PV",
    description: "Page view and dwell-time event.",
  },
];
