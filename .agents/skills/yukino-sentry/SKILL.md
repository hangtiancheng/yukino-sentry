---
name: yukino-sentry
description: >-
  Integration guide for @yukino.js/sentry, a browser monitoring and analytics SDK.
  Use this skill whenever the user mentions @yukino.js/sentry, yukino-sentry, frontend monitoring,
  frontend error tracking, browser performance monitoring, declarative click tracking,
  exposure tracking, white-screen detection, screen recording, Web Vitals, PV/dwell-time,
  offline report caching, or any task involving integrating browser observability into
  a React, Vue, or vanilla TypeScript/JavaScript project. Also trigger when the user asks
  about yukino-sentry-* attributes, ReactErrorBoundary from this SDK, vuePlugin, the Vite
  dev-server mock plugin (sentryPlugin), the webpack dev-server mock plugin
  (SentryWebpackPlugin / sentryMiddleware), the backend ingest server, or dev-time source
  map resolution of reported errors. Even if the user simply says "add monitoring" or
  "add tracking" in a frontend context, consult this skill first.
---

# @yukino.js/sentry — Integration and Usage Guide

Guide for `@yukino.js/sentry` (npm package `@yukino.js/sentry`, version `0.0.1`). All facts come from the SDK source at `sentry/src/`, the backend at `server/`, and the demo app at `client/`.

## Package Exports

Six entry points, each published as ESM, CJS, and TypeScript declarations (`sentry/package.json` `exports`):

| Subpath                     | Purpose                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@yukino.js/sentry`         | Core SDK, all types, enums, and the `SentryPlugin` base class                                                      |
| `@yukino.js/sentry/plugins` | `PerformancePlugin`, `ScreenRecordPlugin`, `ExposurePlugin`, `unzipScreenRecord`, `ScreenRecordPluginOptions` type |
| `@yukino.js/sentry/react`   | `ReactErrorBoundary` component                                                                                     |
| `@yukino.js/sentry/vue`     | Vue 3 plugin `vuePlugin`                                                                                           |
| `@yukino.js/sentry/vite`    | Vite dev-server mock plugin with source map resolution (`sentryPlugin`)                                            |
| `@yukino.js/sentry/webpack` | Webpack dev-server mock plugin (`sentryPlugin` / `SentryWebpackPlugin` / `sentryMiddleware`)                       |

The core entry re-exports everything from `sentry/src/types` (`export * from "./types"` in `sentry/src/index.ts`), so `EventType`, `Status`, `BreadcrumbType`, the abstract `SentryPlugin` class, the hook types (`BeforeSendHook`, `BeforeSendBatchHook`, `AfterSendHook`, `BeforeBreadcrumbHook`), and all `I*`/`T*` types import directly from `@yukino.js/sentry`. `sentry/src/index.ts` itself exports: `init`, `destroy`, `isInitialized`, `enablePlugin`, `setUserId`, `setVisitorId`, `getIdentity`, `beforeSend`, `beforeSendBatch`, `afterSend`, `flushOfflineCache`, `traceError`, `tracePerformance`, `traceCustomEvent`, `tracePageView`, `reportFrameworkError`, and the `InitOptions` type.

## Installation

`npm install @yukino.js/sentry`. React (`^16 || ^17 || ^18 || ^19`), Vue (`^3`), Vite (`^7 || ^8`), webpack (`^4 || ^5`) are optional peer dependencies; install only what the matching integration needs. `@yukino.js/sentry/webpack` also needs `webpack-dev-server` in dev.

## Quick Start

The minimum viable integration is `init` with a non-empty `dsn`. Plugins are instantiated by the caller and passed to `enablePlugin`. If `dsn` is `""` or `disabled` is `true`, `init` returns without installing listeners (the reason is logged when `debug` is enabled).

```ts
import { init, enablePlugin } from "@yukino.js/sentry";
import {
  PerformancePlugin,
  ScreenRecordPlugin,
  ExposurePlugin,
} from "@yukino.js/sentry/plugins";

init({ dsn: "/api/log", projectId: "checkout-web", userId: "user-001" });

const exposure = new ExposurePlugin();
enablePlugin(new PerformancePlugin(), new ScreenRecordPlugin(), exposure);
```

### init

Behavior, in source order (`sentry/src/core/sdk-lifecycle.ts`):

1. If `isInitialized()` is already `true`, return. One init per lifecycle.
2. Validate `{ ...DEFAULT_OPTIONS, ...provided }` with zod (`optionsSchema`, `sentry/src/core/options-schema.ts`); `undefined` fields are dropped before merging. A schema violation **throws** a `ZodError`. The result is written via `sentry.setOptions`.
3. Return early if `disabled` or `dsn === ""` (options are still applied).
4. Set the breadcrumb buffer capacity from `maxBreadcrumbs`, then call `setup()` (`sentry/src/core/setup.ts`): subscribes handlers on the internal event bus and installs capture decorators for every enabled event type, starts white-screen detection when `enableWhiteScreen` is `true`, runs `initPageView()`, and registers the `pagehide` dwell flush.
5. Kick off `initIdentity()` (FingerprintJS) without awaiting it.

The event bus isolates handler exceptions: one throwing handler does not stop the others (`sentry/src/core/bus.ts`).

### destroy / isInitialized

`destroy()` calls `plugin.destroy?.()` on every registered plugin and clears the registry; runs the `setup()` cleanup in reverse order (reverses all capture decorators, stops white-screen sampling, removes the `pagehide` listener); resets page-view state and bus subscriptions; destroys the batch-error manager; resets the `DataReporter` singleton (clearing timers, removing online/offline listeners, dropping queued events); and clears per-session state (breadcrumb buffer, error-dedup set, `shouldScreenRecord`). Use it when resetting tests, unloading a micro-frontend, or dynamically disabling monitoring; a later `init` starts clean. `isInitialized()` returns `true` only after `init` completed `setup()`; a `disabled: true` or empty-`dsn` init leaves it `false`, and `destroy` resets it.

### enablePlugin

`enablePlugin(...plugins: SentryPlugin[]): void` calls `plugin.init()` on each argument and adds the instance to an internal `Set<SentryPlugin>`. It returns `void`, so keep your own reference to any plugin whose instance methods you need later (e.g. `ExposurePlugin.observe`). Call it after `init` so plugin initialization sees the parsed options.

## Configuration Options

`init` accepts `InitOptions`: every field of `Options` is optional except `dsn`. Omitted fields use `DEFAULT_OPTIONS` (`sentry/src/constants/index.ts`). Hook options `beforeBreadcrumb`, `beforeSend`, `beforeSendBatch`, `afterSend` are documented under "Reporter Hooks".

| Option                      | Type                   | Default                                             | Description                                                     |
| --------------------------- | ---------------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| `dsn`                       | `string`               | `""`                                                | Report endpoint URL. Required; must be non-empty to initialize. |
| `projectId`                 | `string`               | `"unknown"`                                         | Frontend project identifier.                                    |
| `userId`                    | `string`               | `"unknown"`                                         | Current user identifier.                                        |
| `disabled`                  | `boolean`              | `false`                                             | Disable the SDK entirely.                                       |
| `enableXhr`                 | `boolean`              | `true`                                              | Capture XMLHttpRequest requests.                                |
| `enableFetch`               | `boolean`              | `true`                                              | Capture fetch requests.                                         |
| `enableClick`               | `boolean`              | `true`                                              | Capture declarative click events.                               |
| `enableError`               | `boolean`              | `true`                                              | Capture runtime, `console.error`, and resource errors.          |
| `enableUnhandledRejection`  | `boolean`              | `true`                                              | Capture unhandled promise rejections.                           |
| `enableHashChange`          | `boolean`              | `true`                                              | Capture hash navigation.                                        |
| `enableHistory`             | `boolean`              | `true`                                              | Capture history (pushState/replaceState/popstate) navigation.   |
| `enableWhiteScreen`         | `boolean`              | `true`                                              | Enable white-screen detection.                                  |
| `enableFingerprint`         | `boolean`              | `false`                                             | Enable FingerprintJS anonymous visitor identity.                |
| `enableHttpPerformance`     | `boolean`              | `false`                                             | Report successful HTTP requests as performance events.          |
| `repeatCodeError`           | `boolean`              | `false`                                             | Report duplicate errors (deduplication is on by default).       |
| `debug`                     | `boolean`              | `false`                                             | Enable SDK debug logging in the browser console.                |
| `anonymousId`               | `string`               | `"unknown"`                                         | SDK-generated anonymous visitor id.                             |
| `visitorId`                 | `string`               | `"unknown"`                                         | Backend-bound visitor id.                                       |
| `screenRecordDurationMs`    | `number`               | `3000`                                              | Rolling screen record window length in ms.                      |
| `screenRecordEventTypes`    | `EventType[]`          | `[Error, Xhr, Fetch, Resource, UnhandledRejection]` | Event types that trigger screen record reporting.               |
| `hasSkeleton`               | `boolean`              | `false`                                             | Whether the page has a skeleton screen.                         |
| `rootCssSelectors`          | `string[]`             | `["html", "body", "#app", "#root"]`                 | Root selectors used by white-screen detection.                  |
| `clickThrottleDelay`        | `number`               | `0`                                                 | Click capture throttle delay in milliseconds.                   |
| `maxBreadcrumbs`            | `number`               | `30`                                                | Breadcrumb capacity (FIFO buffer of the newest items).          |
| `ignoreErrors`              | `(string \| RegExp)[]` | `[]`                                                | Runtime error ignore rules.                                     |
| `excludeAPIs`               | `(string \| RegExp)[]` | `[]`                                                | HTTP request ignore rules.                                      |
| `cacheMaxLength`            | `number`               | `10`                                                | Maximum batch size before flush.                                |
| `cacheWaitingTime`          | `number`               | `2000`                                              | Batch wait time in milliseconds.                                |
| `maxQueueLength`            | `number`               | `200`                                               | Maximum queued events while offline or retrying.                |
| `retryIntervalMilliseconds` | `number`               | `60000`                                             | Upper bound of the server-recovery probe backoff.               |
| `offlineCacheKey`           | `string`               | `"yukino_sentry_offline_cache"`                     | localStorage key for offline cache.                             |
| `tracesSampleRate`          | `number`               | `1`                                                 | Sampling rate from 0 to 1.                                      |

Zod constraints: `maxBreadcrumbs`, `cacheMaxLength`, `maxQueueLength` are positive integers; `screenRecordDurationMs`, `clickThrottleDelay`, `cacheWaitingTime`, `retryIntervalMilliseconds` are non-negative; `tracesSampleRate` is between 0 and 1; hooks must be functions.

## Event Types

`EventType` (`sentry/src/types/enums.ts`) — enum member = string value: `Xhr` = `"XMLHttpRequest"`, `Fetch` = `"fetch"`, `Click` = `"Click"`, `HashChange` = `"Event hashchange"`, `History` = `"History"`, `Resource` = `"Resource"`, `UnhandledRejection` = `"Event unhandledrejection"`, `Error` = `"Error"`, `Vue` = `"Vue"`, `React` = `"React"`, `OtherFrameworks` = `"OtherFrameworks"`, `Performance` = `"Performance"`, `ScreenRecord` = `"ScreenRecord"`, `Exposure` = `"Exposure"`, `WhiteScreen` = `"WhiteScreen"`, `Custom` = `"Custom"`, `PV` = `"PV"` (page view and dwell-time).

## Error Capture

Sources, all routed through `handleError` (`sentry/src/core/handle-error.ts`):

1. **`window` `error` events** — `globalThis.addEventListener("error", listener, true)`. `ErrorEvent` instances go to `handleCodeError`; plain `Event`s whose target exposes `localName` plus `src` or `href` go to the resource-error path.
2. **Resource load errors** — a failed `<img>`/`<script>` (exposes `src`) or `<link>` (exposes `href`) dispatches a plain `Event`. Reported as `EventType.Resource` with `name` = `localName`, `src`/`href` fields, and `message` `"Failed to load <localName>: <src|href>"`.
3. **`console.error`** — the SDK decorates `console.error`, publishing the first `Error` argument or, if none, all arguments stringified and joined by a space. A reentrancy flag prevents self-capture; the original `console.error` is always called afterwards; the debug logger uses a native `console.error` captured before decoration.
4. **Unhandled promise rejections** — the `unhandledrejection` listener unwraps `reason`: an `ErrorEvent` reason goes to `handleCodeError`, anything else through `handleError` with the reason as `extra`.
5. **React ErrorBoundary errors** — `EventType.React` via `reportFrameworkError`, `context: errorInfo`. **Vue `app.config.errorHandler` errors** — `EventType.Vue` via `reportFrameworkError`, `context: { vueInstance, info }`.

Classification dispatches on `extra`: `ErrorEvent` → `handleCodeError` (reported as `Error` with `line`/`column`; `extra` = the underlying `Error`'s stack when present); resource-like `Event` → `reportResourceError` (`Resource`); `Error` → `reportRuntimeError` (`Error`, `extra` = `stack || error`); anything else → `reportUnknownError` (`Error` with `name: "Unknown Error"`).

### Deduplication and Batching

All error paths deduplicate by default with a string key in a `BoundedSet<string>` (LRU-style, capacity 1000) on the `sentry` singleton (`sentry/src/core/error-dedup.ts`): code errors `Error-<message>-<filename>-<line>-<column>`; resource errors `Resource-<localName>-<src|href>`; runtime/unknown `Error-<name>-<message>`. Code errors whose filename is empty or `"unknown"` bypass dedup and are always reported. `repeatCodeError: true` disables dedup entirely.

Only **code errors** also pass through the `BatchErrorManager` (`sentry/src/core/handle-code-error.ts`): it debounces 2 s after the last error, groups by `type-name-message`; groups of fewer than 5 errors report individually; groups of 5 or more collapse into one `IBatchErrorData` report (first item plus `batchError: true`, `batchErrorLength`, `batchErrorLastHappenTime`). Resource, runtime, and framework errors report immediately.

`ignoreErrors` accepts strings (substring match) and RegExp (`pattern.test(message)`) — checked on code, runtime, and unknown errors, not on resource errors (`sentry/src/utils/is-ignored-error.ts`).

## HTTP Capture

The SDK decorates `XMLHttpRequest.prototype.open`/`send` and `globalThis.fetch` (`sentry/src/core/decorate-http.ts`).

- `open()` stores method (uppercased), URL, and base data on the XHR under `__sentry__`. `send()` refreshes the payload timestamp (so `elapsedTime` measures from `send()`, not `open()`) and adds a once-only `loadend` listener recording status code, parsed `server-timing` header, and elapsed time. `requestData` (`{ body }`) and `responseData` (`{ responseType, response }`) are captured **only for error statuses** (`0` or `>= 400`); string responses truncate to 8 KB.
- The `fetch` decoration accepts `string`, `URL`, and `Request` inputs (URL from the string, `URL.href`, or `Request.url`; method from `RequestInit.method`, else `Request.method`, else `GET`, always uppercased). Ignored requests bypass instrumentation with zero overhead. Status, `Server-Timing` headers, and elapsed time are recorded for every captured request. The body is read via `res.clone().text()` only for error statuses, truncated to 8 KB, in the background so the caller is never delayed; a failed clone read still publishes without `responseData`. Network rejections publish with `statusCode: 0` and `message` = the error message (or `"Network error"`) and re-throw the original error.

### Status Classification (`sentry/src/utils/transform-http-data.ts`)

`transformHttpData` returns a **new** object with derived `status`/`message`:

| Status Code | SDK Status     | Derived message                                        |
| ----------- | -------------- | ------------------------------------------------------ |
| 0           | `Status.Error` | Original network-error message, else `"Network error"` |
| 100–199     | `Status.OK`    | `"Informational response"`                             |
| 200–299     | `Status.OK`    | `"Successful responses"`                               |
| 300–399     | `Status.OK`    | `"Redirection messages"`                               |
| 400–499     | `Status.Error` | `"Client error responses"`                             |
| 500–599     | `Status.Error` | `"Server error responses"`                             |
| Other       | `Status.Error` | `"Invalid status code"`                                |

Only `Status.Error` requests are reported by default. With `enableHttpPerformance: true`, successful requests also report an `EventType.Performance` event with `name: "HTTP <METHOD>"`, `message` = the API path, `value` = `elapsedTime`, `extra: { method, statusCode, serverTiming }`.

`shouldIgnoreRequest` skips a request when it is a `POST` to the exact configured `dsn` or when `isExcludedApi` matches: `excludeAPIs` uses **exact string equality** for strings and `pattern.test(api)` for RegExp — unlike the substring matching of `ignoreErrors` (`sentry/src/utils/is-excluded-api.ts`). Separately, `handleHttp` omits the breadcrumb for any request whose API **contains** the `dsn`, so SDK traffic never pollutes the trail.

## Page Views and Dwell Time

All PV events use `EventType.PV`, distinguished by `name` (`sentry/src/core/pv-lifecycle.ts`).

1. **`PageLoad`** — reported immediately (`immediate: true`) from `setup()`; `extra` is `{ url, referrer, entryTime }`.
2. **Route changes** — on hash/history navigation, `recordRoutePageView` normalizes URLs against `location.href`, skips when the target URL equals the current page, reports **`PageDwell`** for the previous page (`extra: { url, referrer, duration }`; durations ≤ 100 ms are dropped), then reports a new PV named `"HistoryChange"` or `"HashChange"`.
3. **`pagehide`** — flushes the current dwell time with `immediate: true` (fires reliably on mobile where `beforeunload` does not).

Manual: `tracePageView({ name?, message?, extra? })` — defaults `name` `"ManualPageView"`, `message` `location.href`, `extra` `{ url, referrer }`.

## Declarative Click Tracking

Declarative clicks use `yukino-sentry-*` HTML attributes (`sentry/src/utils/click-data.ts`). Plain clicks are **not** reported: `getDeclarativeClickData` walks the composed path (falling back to a `parentElement` walk when `composedPath()` yields no `HTMLElement`) and returns `null` unless some element carries `yukino-sentry-view`, `yukino-sentry-ev`, or `yukino-sentry-msg`.

| Attribute            | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| `yukino-sentry-ev`   | Explicit event ID. First priority for event identification.               |
| `yukino-sentry-msg`  | Human-readable message. Highest priority for the reported `msg` field.    |
| `yukino-sentry-view` | View/container ID. Fallback for event ID if `yukino-sentry-ev` is absent. |

Any other `yukino-sentry-*` attribute becomes a param. Params come from the **nearest single element in the path** that has any `yukino-sentry-*` attribute — not merged across ancestors; empty values become `null`. So a click on `<article yukino-sentry-view="product-list" yukino-sentry-ev="product-click" yukino-sentry-sku="SKU-001">` reports `params: { sku: "SKU-001" }`; duplicate any attribute you need on the element that is actually clicked.

The event ID `ev` resolves by searching the path in order: `yukino-sentry-ev` → `title` → `yukino-sentry-view` → the nearest element's lowercased tag name → `"unknown"`. The `msg` field resolves from the nearest element carrying a tracking attribute: `yukino-sentry-msg` → `title` → trimmed `textContent` → `aria-label` → lowercased tag name.

The reported `DeclarativeClickData` (stored in `extra`) carries `ev`, `msg`, `triggerPageUrl` (`location.href`), `x`/`y` (clicked element's bounding-rect left/top plus `documentElement` scroll offsets), `params`, `elementPath`, `triggerTime`. `elementPath` comes from `dom2str` (`sentry/src/utils/dom2str.ts`): a `" > "`-joined selector chain like `body > div#app > button.btn.primary`, at most 5 levels up, stopping at `html`, capped at 128 characters (whole selectors are dropped rather than truncated), `"<unknown>"` on exception.

`handleClick` sets `name` to `clickData.ev || clickData.msg`, `message` to `clickData.msg || clickData.ev`, pushes a breadcrumb, and reports. The pipeline is installed only when `enableClick` is `true`. `clickThrottleDelay > 0` throttles capture; the throttle is bound once when the listener is installed, so changing the option after `init` has no effect.

## White-Screen Detection

Started directly by `setup()` when `enableWhiteScreen` is `true` (not via the event bus) and stopped by `destroy()` (`sentry/src/core/white-screen.ts`).

1. Waits for `document.readyState === "complete"` or the `load` event, then samples on a `setInterval` at `WHITE_SCREEN_SAMPLE_INTERVAL` (1000 ms), each sample wrapped in `requestIdleCallback` (1000 ms timeout) when available.
2. Each sample probes a 3 × 6 grid of 18 points (x-ratios 0.1/0.5/0.9, y-ratios 0.1/0.26/0.42/0.58/0.74/0.9 of the viewport) with `document.elementFromPoint`. A point is "empty" when it resolves to `null` or to an element whose id, class+attribute, or tag selector (per `getCssSelectors`) is in `rootCssSelectors`. A sample is "white" when all 18 points are empty.
3. Sampling stops as soon as a non-white sample is observed. A white screen is reported when the page stays white for `MAX_WHITE_SCREEN_SAMPLE_COUNT` (10) consecutive samples, then sampling stops.

The event is `EventType.WhiteScreen`, `Status.Error`, `name: "WhiteScreen"`, `message: "sample count <n>"`, `extra: { sampleCount }`. When `hasSkeleton: true`, the first sample records the CSS selectors it encountered as a baseline; later samples whose selector set differs stop sampling (content rendered); if the set is still identical at the 10th sample, a white screen is reported.

## Visitor Identity

| Field         | Source                                                                                |
| ------------- | ------------------------------------------------------------------------------------- |
| `anonymousId` | FingerprintJS visitor id, persisted in localStorage key `yukino_sentry_anonymous_id`. |
| `visitorId`   | Backend-bound visitor id, set via `setVisitorId()`.                                   |
| `userId`      | Current user id, set via `setUserId()` or `init({ userId })`.                         |

All three are attached to every report envelope. With `enableFingerprint: true`, `initIdentity()` reuses the stored value if present, otherwise dynamically imports `@fingerprintjs/fingerprintjs`, generates a visitor id, and persists it; failures are logged and never block initialization. When disabled, `anonymousId` stays `"unknown"` (`sentry/src/core/identity.ts`). `getIdentity()` returns `{ anonymousId, visitorId, userId, hasAnonymousId, hasVisitorId }`, where the `has*` flags are `value !== "unknown"`.

## Manual APIs

- `traceError(error: unknown)` — routes a manual error through the full `handleError` classification pipeline.
- `tracePerformance({ name, message, value })` — `EventType.Performance`, `Status.OK`.
- `traceCustomEvent({ name, message, extra? })` — `EventType.Custom`, `Status.OK`.
- `tracePageView({ name?, message?, extra? })` — see "Page Views and Dwell Time".
- `reportFrameworkError({ type, error, context })` — all three fields required; `type` must be `EventType.React`, `EventType.Vue`, or `EventType.OtherFrameworks`. Reports with `Status.Error`; `name` comes from `error.name`, `"null"`/`"undefined"`, the prototype constructor name (else `"Object"`), else `typeof`; `message` from `error.message`, the string itself, `"null"`/`"undefined"`, else JSON serialization (fallback `String(error)`); `extra` is `{ error, stack, context }`, where `stack` reads `error.stack` or a string `stack` property on plain objects (`sentry/src/core/framework-error.ts`). Use it to integrate any other framework.

## Reporter Hooks

Hooks can be passed in `init` options or registered programmatically via `beforeSend(hook)`, `beforeSendBatch(hook)`, `afterSend(hook)` — both write the same option fields, so the later call wins.

- `beforeSend` (`BeforeSendHook`): receives one `IReportData`; return it (possibly modified) or `false` to drop. May return a Promise.
- `beforeSendBatch` (`BeforeSendBatchHook`): receives `readonly IReportData[]` before transport; return the array or `false` (e.g. `eventList.filter((item) => item.status !== "OK")`). May return a Promise. An empty result or `false` schedules another flush instead of sending.
- `afterSend` (`AfterSendHook`): receives the batch after successful transport; the return value is ignored and not awaited.
- `beforeBreadcrumb` (`BeforeBreadcrumbHook`): receives `IBreadcrumbItem` before it enters the bounded buffer and must return the item synchronously. Breadcrumb `userAction` comes from `event2breadcrumb` (`sentry/src/utils/event2breadcrumb.ts`): `Error`/`Vue`/`React`/`UnhandledRejection` → `BreadcrumbType.CodeError`; `Xhr`/`Fetch` → `Http`; `Click` → `Click`; `HashChange`/`History` → `Route`; `Resource` → `Resource`; everything else → `Custom`.

## Reporter

`DataReporter` is the single data outlet (`sentry/src/reporter/index.ts`); the module-level export is a `Proxy` that defers singleton construction to first property access.

`send(payload, immediate = false)` flow: (1) `shouldQueuePayload` preflight (`sentry/src/reporter/send-preflight.ts`) rejects an empty `dsn`, rejects when `Math.random() > tracesSampleRate`, and sets `sentry.shouldScreenRecord = true` for types in `screenRecordEventTypes`; (2) the `IReportData` envelope is built and `beforeSend` applied (awaiting Promise results) — `false` drops the event; (3) the event is pushed onto the internal queue — if offline, the queue is capped to `maxQueueLength`, persisted to localStorage, and the call returns; (4) the queue flushes immediately when `immediate` or `events.length >= cacheMaxLength`, otherwise a flush is scheduled after `cacheWaitingTime`.

Flush behavior (`sentry/src/reporter/flush-scheduler.ts`, `transports.ts`):

1. Returns early on an empty queue; an `isFlushing` guard prevents concurrent flushes; an offline queue is capped, persisted, and the flush aborts.
2. Up to `cacheMaxLength` items are spliced off the head and passed through `beforeSendBatch` (Promises awaited); an empty result schedules the next flush.
3. The batch is JSON-serialized **once**, then sent: `navigator.sendBeacon` for bodies up to 60 KB (`MAX_KEEPALIVE_BYTES`), otherwise `fetch` POST with `Content-Type: application/json`. `keepalive: true` is set only when the body is ≤ 60 KB, because Chromium rejects larger keepalive fetches and the queue head would stall forever.
4. On transport failure the batch is prepended back, capped, persisted, and the server-recovery probe is armed. On success, `afterSend` runs. If events remain, another flush is scheduled after 100 ms.

Offline cache (`sentry/src/reporter/offline-cache.ts`): events persist under `offlineCacheKey`, trimmed to the last `maxQueueLength` entries. On reporter construction the cache is loaded and validated against `reportDataListSchema` (zod); only a valid cache is removed from localStorage — an invalid one stays for debugging (a `JSON.parse` throw does remove it). The `online` event marks the reporter online and flushes the in-memory queue; `offline` marks it offline (`sentry/src/reporter/network-listener.ts`). After a failed report, the reporter probes recovery with `fetch(dsn, { method: "HEAD" })` using exponential backoff starting at 1 s, doubling on each failure and capped at `retryIntervalMilliseconds`; a successful probe resets the backoff, marks the reporter online, and flushes (`sentry/src/reporter/server-recovery.ts`). Probe and flush timers are unref'd, so they never keep a Node process alive. `await flushOfflineCache()` loads the offline cache into the queue and flushes it.

## Report Data Schema

Each reported event is an `IReportData` (`sentry/src/types/common.ts`, envelope built in `sentry/src/reporter/report-data.ts`):

| Field         | Type                | Description                                                                                |
| ------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `id`          | `string`            | Reporter instance id (`generateUUID()`), shared by every event from one reporter.          |
| `type`        | `EventType`         | Event type enum value.                                                                     |
| `name`        | `string`            | Event name.                                                                                |
| `message`     | `string`            | Event message.                                                                             |
| `status`      | `Status`            | `"OK"` or `"Error"`.                                                                       |
| `time`        | `string`            | ISO 8601 formatted time.                                                                   |
| `timestamp`   | `number`            | `Date.now()`.                                                                              |
| `url`         | `string`            | `location.href`.                                                                           |
| `userId`      | `string`            | User identifier.                                                                           |
| `anonymousId` | `string`            | FingerprintJS id (`"unknown"` when disabled).                                              |
| `visitorId`   | `string`            | Backend-bound visitor id (`"unknown"` until `setVisitorId`).                               |
| `projectId`   | `string`            | Project identifier.                                                                        |
| `sdkVersion`  | `string`            | SDK version read from `sentry/package.json`.                                               |
| `breadcrumbs` | `IBreadcrumbItem[]` | Present **only** on error-class types (below).                                             |
| `deviceInfo`  | `IDeviceInfo`       | Browser/OS/device/language/screen data, collected lazily on first report (`ua-parser-js`). |
| `payload`     | `TReportPayload`    | Original event payload — carries its own `id`, `deviceId`, and `sessionId`.                |

Breadcrumbs attach only to `Error`, `UnhandledRejection`, `Resource`, `Vue`, `React`, and `OtherFrameworks` events (`BREADCRUMB_EVENT_TYPES`); other types skip them to keep batches small.

## Plugin System

A plugin extends the abstract `SentryPlugin` (exported from `@yukino.js/sentry`; `sentry/src/types/plugin.ts`), implements `init()`, and optionally `destroy()`. Enabled plugins live in an internal `Set<SentryPlugin>`; the SDK `destroy()` calls each plugin's `destroy()` when available and clears the set (`sentry/src/core/plugin-registry.ts`).

```ts
import { SentryPlugin, enablePlugin } from "@yukino.js/sentry";

class HeartbeatPlugin extends SentryPlugin {
  private timer: ReturnType<typeof setInterval> | null = null;
  init(): void {
    this.timer = setInterval(() => {
      /* traceCustomEvent(...) */
    }, 30_000);
  }
  override destroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}

enablePlugin(new HeartbeatPlugin());
```

## PerformancePlugin

```ts
import { enablePlugin } from "@yukino.js/sentry";
import { PerformancePlugin } from "@yukino.js/sentry/plugins";

enablePlugin(new PerformancePlugin()); // takes no constructor options
```

Every metric is an `EventType.Performance` event; `name` identifies it (`sentry/src/plugins/performance/`):

| Reported `name`                    | Source                                                                                                                                                                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `LCP`, `FCP`, `CLS`, `INP`, `TTFB` | Web Vitals via `web-vitals`, carrying `value` and `rating`; the metric's own `id` replaces the payload `id`.                                                                                                                                                                         |
| `FSP`                              | First Screen Paint — a `MutationObserver` watches inserted nodes (excluding `link`/`script`/`style`) and an `IntersectionObserver` records the latest intersection time; resolution is driven by a `requestAnimationFrame` loop that waits for `document.readyState === "complete"`. |
| `NavigationTiming`                 | Page-load metrics in `extra`: paintTime, domInteractive, domContentLoaded, loadEvent, firstByte, dnsLookup, tcpConnection, tlsHandshake, timeToFirstByte, contentTransfer, domProcessing, resourceLoad, redirect, unloadTime, triggerPageUrl.                                        |
| `ResourceList`                     | Snapshot of the buffered `resource` entries (filtered as below) at page ready, in `resourceList`.                                                                                                                                                                                    |
| `ResourceTiming`                   | One event per live `resource` entry from `PerformanceObserver`, `value` = duration, `extra.resource`.                                                                                                                                                                                |
| `LongTask`                         | `PerformanceObserver` for `longtask`, entries in `longTasks`.                                                                                                                                                                                                                        |
| `Memory`                           | `performance.measureUserAgentSpecificMemory()` result in `memory`, when supported.                                                                                                                                                                                                   |

Resource collection excludes `fetch`, `xmlhttprequest`, and `beacon` initiator types and any URL containing the SDK `dsn`; `fromCache` derives from `transferSize === 0` or an empty `encodedBodySize`. When `PerformanceObserver` does not support the `resource` entry type, a `MutationObserver` fallback watches inserted `<img>`/`<script>`/`<link>` elements and reports on their `load`/`error` (once per URL), reusing real `PerformanceResourceTiming` data when present or a zero-duration fallback object otherwise. Capability checks go through `supportsPerformanceEntryType()` (reads `PerformanceObserver.supportedEntryTypes`); unsupported capabilities are skipped. `destroy()` runs registered cleanups in reverse order.

## ScreenRecordPlugin

```ts
import {
  ScreenRecordPlugin,
  unzipScreenRecord,
  type ScreenRecordPluginOptions,
} from "@yukino.js/sentry/plugins";

enablePlugin(new ScreenRecordPlugin({ durationMs: 5000 })); // or no options
```

Based on `@rrweb/record`; keeps a rolling record window and reports it when a matching event occurs (`sentry/src/plugins/screen-record/`). `ScreenRecordPluginOptions`: `durationMs` (default `3000`, `DEFAULT_OPTIONS.screenRecordDurationMs`) sets the rolling window length; `eventTypes` (default `[Error, Xhr, Fetch, Resource, UnhandledRejection]`) sets the trigger set.

1. `init()` writes `screenRecordDurationMs` and `screenRecordEventTypes` from the constructor options into SDK options via `sentry.setOptions` (arrays are copied, so plugin instances never share option array references).
2. `@rrweb/record` and `pako` are dynamically imported, then `record()` starts with `recordCanvas: true` and `checkoutEveryNms` set to the record window. A load failure is logged and the plugin degrades to a no-op.
3. Emitted events are validated (loose object with numeric `timestamp`) and kept in a rolling window pruned in place to the last `durationMs` milliseconds.
4. When `sentry.shouldScreenRecord` is `true` (set by the preflight for matching event types) and the window is non-empty, the window is JSON-serialized, gzipped with `pako.gzip`, base64-encoded (in 32 KB chunks) into the payload `event` field, and reported with `name: "ScreenRecord"` plus `eventCount`. The flag resets after reporting.
5. `destroy()` calls the `stopRecord` function returned by rrweb.

`await unzipScreenRecord(recordPayload)` base64-decodes, `pako.ungzip`-decompresses, then JSON-parses; returns `null` for empty input and dynamically imports `pako` when needed, so it works in any context.

## ExposurePlugin

```ts
import { ExposurePlugin } from "@yukino.js/sentry/plugins";

const exposure = new ExposurePlugin();
enablePlugin(exposure);
exposure.observe({
  target: element,
  threshold: 0.5,
  params: { bannerId: "spring-001" },
});
exposure.observe([
  { target: first, threshold: 0.5 },
  { target: second, threshold: 0.75 },
]); // arrays too
exposure.unobserve(element); // also accepts an array
```

Measures how long elements are visible using `IntersectionObserver` (`sentry/src/plugins/exposure/index.ts`). `observe` inputs are validated with zod (`exposureTargetSchema`), so an invalid `target` or out-of-range `threshold` throws.

| Parameter   | Type                      | Default  | Description                               |
| ----------- | ------------------------- | -------- | ----------------------------------------- |
| `target`    | `Element`                 | required | The DOM element to observe.               |
| `threshold` | `number` (0–1)            | `0.5`    | Intersection ratio threshold.             |
| `params`    | `Record<string, unknown>` | `{}`     | Custom parameters included in the report. |

An explicit `threshold` of `0` is respected (`item.threshold ?? 0.5`). Re-observing an element already in the internal map is a no-op, keeping its original `threshold`/`params`. One `IntersectionObserver` is created per unique threshold and reused; `unobserve` calls the matching observer and removes the element from the map; `destroy()` disconnects all observers and clears both maps.

An exposure event reports when an observed element leaves the viewport after having been visible: `name: "Exposure"`, `message: "Element Exposure"`, `Status.OK`, `extra` = `{ threshold, observeTime, showTime, showEndTime, duration, params }` (`duration = showEndTime - showTime`). Elements never made visible report nothing; elements still visible at teardown are not flushed.

## React Integration

```tsx
import { ReactErrorBoundary } from "@yukino.js/sentry/react";

<ReactErrorBoundary fallback={<div>Something went wrong</div>}>
  <Page />
</ReactErrorBoundary>;
```

`ReactErrorBoundaryProps` (`sentry/src/react.ts`): `children?: ReactNode`, `fallback?: ReactNode | ((error: Error, errorInfo?: ErrorInfo) => ReactNode)`.

- `static displayName = "ReactErrorBoundary"`; `getDerivedStateFromError(error)` sets `{ error }` in the render phase so the fallback appears immediately.
- `componentDidCatch(error, errorInfo)` merges `{ error, errorInfo }` into state and reports `EventType.React` via `reportFrameworkError` with `context: errorInfo`.
- `render()` returns the fallback (or `null` when absent) in the error state, otherwise `children ?? null`. With a render-function `fallback`, `errorInfo` is **optional**: the boundary renders during `getDerivedStateFromError`, before React delivers `ErrorInfo` in `componentDidCatch`, so the function may be called once without it and again once it is available.

React ErrorBoundary does not catch async callback errors, event-handler errors, or SSR errors — use `traceError` for those.

## Vue 3 Integration

```ts
import { createApp } from "vue";
import { vuePlugin } from "@yukino.js/sentry/vue";
import App from "./app.vue";

createApp(App)
  .use(vuePlugin, { dsn: "/api/log", projectId: "vue-app" })
  .mount("#app");
```

`vuePlugin` is a Vue `Plugin` (`sentry/src/vue.ts`) that captures the existing `app.config.errorHandler`, installs one that reports `EventType.Vue` via `reportFrameworkError` with `context: { vueInstance, info }` and chains the previous handler if any, then calls `init(options)`. It accepts the same `InitOptions` as `init()`.

## Vite Dev-Server Plugin

A dev-server mock report endpoint that writes reported data to log files instead of a real server (`sentry/src/vite.ts`). The `@yukino.js/sentry/vite` entry exports `sentryPlugin` (named export and default export); one factory covers the supported Vite peer range (`^7 || ^8`). Options default to `{}` (`ISentryPluginOptions`); `dsn` is the URL path to intercept, defaulting to `"/sentry"` (`DEFAULT_MOCK_DSN` in `sentry/src/node/dev-endpoint.ts`).

```ts
// vite.config.ts
import { sentryPlugin } from "@yukino.js/sentry/vite";
import { defineConfig } from "vite";

// intercepts POSTs to this exact path; match it to init({ dsn: "/api/log" })
export default defineConfig({ plugins: [sentryPlugin({ dsn: "/api/log" })] });
```

- Only active for the dev server (`apply: "serve"`); `vite build` is untouched and never creates a `logs/` directory.
- On `configureServer`, creates `logs/` in `process.cwd()` and appends to a timestamped `sentry_YYYYMMDDHHMMSS.jsonl` file. Intercepts POST requests whose `req.url` equals the resolved dsn exactly.
- Parses the body with `JSON.parse` and enriches error records with original source positions from the dev server's in-memory module graph (see "Dev-Time Source Map Resolution"); if parsing or enrichment throws, the raw body is written. Always responds `200` with `{ code: 0, message: "success" }`; closes the log stream in `closeBundle` when one was created.

## Webpack Dev-Server Plugin

The same mock endpoint for webpack-dev-server, with source map resolution from emitted `.map` assets (`sentry/src/webpack.ts`). Requires `webpack` and `webpack-dev-server` as dev dependencies. All exports accept `{ dsn?: string }` (`ISentryWebpackPluginOptions`); the dsn resolves like the Vite plugin (option value, else `"/sentry"`).

| Export                | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `sentryPlugin`        | Factory returning a `SentryWebpackPlugin` instance. Named and default export. |
| `SentryWebpackPlugin` | Webpack plugin class (`WebpackPluginInstance`).                               |
| `sentryMiddleware`    | Connect/express-style middleware for manual mounting (no source map support). |
| `SentryDevMiddleware` | Type of the middleware function.                                              |

```ts
// webpack.config.mjs
import { sentryPlugin } from "@yukino.js/sentry/webpack";
export default { plugins: [sentryPlugin({ dsn: "/api/log" })] };
```

- No-op unless `compiler.options.devServer` exists, so production builds are untouched.
- Wraps `devServer.setupMiddlewares` (calling any user-provided setup first) and unshifts the mock middleware named `"sentry-mock"`; the entry deliberately omits `path` because webpack-dev-server's `{ name, path, middleware }` form delegates to `app.use(path, middleware)`, which strips the prefix from `req.url` and would break the `req.url === dsn` match.
- Taps `compiler.hooks.assetEmitted` to collect emitted `.map` assets (works with the in-memory dev-server file system). Reported script URLs resolve to `<path>.map`; unmatched URLs fall back to basename matching to tolerate unknown `publicPath` prefixes.
- Writes `logs/sentry_YYYYMMDDHHMMSS.jsonl` and responds `{ code: 0, message: "success" }`; closes the log stream on `compiler.hooks.shutdown`.
- `sentryMiddleware` can be mounted manually via `devServer.setupMiddlewares`; it writes raw reports without source map enrichment (no compiler asset access).

## Dev-Time Source Map Resolution

Both dev-server plugins enrich reported error records with original source positions before logging. The shared resolver lives in `sentry/src/source-map/` (Node-only, never bundled into the browser SDK) and uses the `source-map` library. For each record in a batch, the first matching rule applies (`sentry/src/source-map/source-map.ts`):

1. `type === "Error"` with a string `name` and numeric `payload.line`/`payload.column` — resolves one frame using the record `name`, which holds the script URL for code errors.
2. `payload.extra` is a stack-like string (matches `at url:line:col` or `fn@url:line:col`) — parses and resolves up to 30 frames (`MAX_FRAMES`).
3. `type` is `"React"`, `"Vue"`, or `"OtherFrameworks"` — reads a string `payload.stack` first, else the stack nested in `payload.extra.stack` (where `reportFrameworkError` puts it), and resolves up to 30 frames.

Records producing at least one frame gain a `sourcemap: { frames: ResolvedFrame[] }` field; other records pass through unchanged; a non-array batch body is returned as-is. `ResolvedFrame` carries `resolved` (`false` on raw-frame passthrough), raw `url`/`line`/`column`/`func` (Chrome and Firefox stack formats), `source`/`originalLine`/`originalColumn`/`name` (resolved original position), and `snippet` (`SnippetLine[]` — the error line plus 3 lines of context on each side, `highlight: true` on the error line, when `sourcesContent` is available).

- **Vite**: maps come from `server.moduleGraph.getModuleByUrl(...).transformResult.map`, trying `pathname + search` first, then `pathname` alone. **Webpack**: maps come from `.map` assets collected via the `assetEmitted` compiler hook.
- Candidate maps are validated with a zod schema (`version`, `sources`, `names`, `mappings`) before use. Browser stack line/column values are 1-based; the resolver converts columns to 0-based before querying. Resolution failures are silent: frames are kept with `resolved: false`, and a batch-level failure writes the raw body.

## Backend Server Endpoints

The companion ingest server (`server/`, Koa + TypeScript; default port 8088, configured in `server/config.yml` together with `server.body_limit`, CORS `allowed_origins`, `log.dir`/`log.file_prefix`/`log.max_size`/`log.rotate_daily`, and `sourcemap.enabled`/`sourcemap.dir`) is what production `dsn: "/api/log"` targets (`server/src/routes.ts`):

| Method & Path          | Behavior                                                                                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/log`        | Accepts a JSON array of `IReportData` events. Responds `204` on success; `400` on empty body; `413` over `body_limit`; `500` on log-write failure. Each batch is appended as one JSONL line under `logs/<YYYY-MM>/sentry_*.jsonl`. |
| `HEAD /api/log`        | Responds `204`. Serves the SDK's server-recovery probe.                                                                                                                                                                            |
| `GET /api/health`      | `{ status: "ok", timestamp, services: { disk } }` — writes and deletes a probe file in the log dir.                                                                                                                                |
| `GET /api/logs/files`  | Lists log files as `{ name, size, mtime, lines }[]`, newest first, `Cache-Control: no-store`.                                                                                                                                      |
| `GET /api/logs/events` | `?file=<YYYY-MM/name.jsonl>` or `all`; returns `{ files, count, events }` sorted by `timestamp` ascending; ETag + `If-None-Match` → `304`; invalid file name → `400`.                                                              |

CORS origins, methods (`POST`, `OPTIONS`, `GET`, `HEAD`), and headers (`Content-Type`, `Authorization`) come from `server/config.yml` (`server/src/index.ts`). When `sourcemap.enabled` is `true`, `POST /api/log` bodies are enriched with the same `sourcemap.frames` fields described above (resolved from `.map` files in `sourcemap.dir`) before being written (`server/src/source-map.ts`).

## Debug Logging

SDK console output is off by default. `debug: true` enables styled, collapsed console groups for all SDK activity (capture, queueing, transport results with elapsed time, plugin init). The logger reads `globalThis.__sentry__?.options.debug` on every call, so toggling at runtime takes effect immediately (`globalThis.__sentry__?.setOptions({ debug: false })`). The `sentry` singleton is assigned to `globalThis.__sentry__` when the SDK module loads (`sentry/src/utils/sentry.ts`), making it a debugging handle for live options and `deviceInfo`. The logger's error output uses a native `console.error` captured before decoration, so `debug` never makes the SDK report its own log lines.

## Browser Compatibility

- `sendBeacon` preferred for batches up to 60 KB; `fetch` POST fallback with `keepalive` only for bodies up to 60 KB.
- `PerformanceObserver` powers Web Vitals, long task, and resource timing; `MutationObserver` powers first-screen paint and the dynamic-resource fallback; `IntersectionObserver` is required by `ExposurePlugin` and used by FSP when available; `requestIdleCallback` is used opportunistically by white-screen sampling with a direct-call fallback; `performance.measureUserAgentSpecificMemory` is optional (Chrome-only).
- `@rrweb/record` and `pako` load dynamically only via `ScreenRecordPlugin`; `@fingerprintjs/fingerprintjs` only when `enableFingerprint: true`.
- UUIDs come from `generateUUID()` (`sentry/src/utils/uuid.ts`): `crypto.randomUUID` when available, else a `crypto.getRandomValues`-based v4, so the SDK works on insecure (plain-http) contexts. `localStorage`/`sessionStorage` access is wrapped in try/catch; blocked-storage browsers fall back to per-call UUIDs.

## Session and Device Identity

| Key                          | Storage        | Description                              |
| ---------------------------- | -------------- | ---------------------------------------- |
| `yukino_sentry_device_id`    | localStorage   | Persistent device identifier (UUID).     |
| `yukino_sentry_session_id`   | sessionStorage | Session identifier (UUID, per tab).      |
| `yukino_sentry_anonymous_id` | localStorage   | FingerprintJS visitor id (when enabled). |

Both ids are generated per payload by `getBaseData()` (`sentry/src/utils/get-base-data.ts`) and arrive on the server inside each event's `payload`.

## Production Configuration Example

The demo app (`client/src/main.tsx`) is a working reference: `init({ dsn: "/api/log", debug: true, enableHttpPerformance: true, excludeAPIs: [/\/api\/logs\//] })` with `PerformancePlugin`, `ScreenRecordPlugin`, and an `ExposurePlugin` instance; declarative `yukino-sentry-ev`/`yukino-sentry-msg` attributes on navigation; `ReactErrorBoundary` on a crash page; `traceError` from a dev error seeder; `unzipScreenRecord` to replay screen records in the dashboard.

```ts
import { init, enablePlugin, beforeSend } from "@yukino.js/sentry";
import {
  PerformancePlugin,
  ScreenRecordPlugin,
  ExposurePlugin,
} from "@yukino.js/sentry/plugins";

init({
  dsn: "https://example.com/api/log",
  projectId: "production-web",
  enableFingerprint: true,
  enableHttpPerformance: true,
  excludeAPIs: ["https://example.com/api/log"],
  ignoreErrors: [/ResizeObserver loop limit exceeded/],
});

const exposure = new ExposurePlugin();
enablePlugin(new PerformancePlugin(), new ScreenRecordPlugin(), exposure);

beforeSend((data) => data); // inspect or transform every report; return false to drop it
```
