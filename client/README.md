# client

The Yukino Sentry **dashboard** — a React 19 + Vite single-page app that visualizes
the data reported by the [`@yukino.js/sentry`](../sentry) SDK: errors, network
requests, performance metrics, user behavior (with screen-record replay), and real-time log streams.

Built on Tailwind CSS 4 and `@base-ui/react` + `shadcn`-style components.

## Features

- **Overview** — aggregate stat cards (PV, errors, performance) on the landing page.
- **Errors** — browsable error list; source maps are resolved server-side to the
  original offending lines.
- **Network** — request logs with status and timing, rendered in a virtualized table
  (`@tanstack/react-virtual`).
- **Performance** — Web Vitals (LCP, CLS, FID/INP) and resource/long-task timings,
  charted with Recharts.
- **Behavior** — session recordings from the `ScreenRecordPlugin`, replayed via
  `@rrweb/replay`.
- **Live log tail** — subscribes to the server's SSE endpoint and streams log events
  into the UI.

## Getting started

This package is a workspace member of the repo root. Run from the repository root:

```sh
pnpm install
pnpm client:dev          # Vite dev server (HMR)
pnpm client:dev:webpack  # alternative webpack dev build
```

| Command                       | Description               |
| ----------------------------- | ------------------------- |
| `pnpm client:build`           | Build with Vite           |
| `pnpm client:build:webpack`   | Build with webpack        |
| `pnpm client:preview`         | Preview the Vite build    |
| `pnpm client:preview:webpack` | Preview the webpack build |

## Layout

```
client/
├── src/
│   ├── pages/          # behavior / errors / network / performance / overview
│   ├── components/     # stat cards, virtual table, log controls, screen-record card
│   ├── lib/            # typed API client + shared helpers
│   └── generated/      # generated shadcn/ui components
├── plugins/            # Vite/webpack plugin integration
└── vite.config.ts / webpack.config.mjs
```
