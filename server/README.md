# server

The Yukino Sentry **report-ingest server** — a Koa 3 service that receives data
from the [`@yukino.js/sentry`](../sentry) SDK, persists it as JSONL logs, and
serves it back to the [dashboard](../client) over a REST + SSE API.

## Endpoints

| Method | Path               | Description                                                          |
| ------ | ------------------ | -------------------------------------------------------------------- |
| `POST` | `/api/log`         | Ingest a batch of reported events.                                   |
| `HEAD` | `/api/log`         | Liveness probe used by the SDK's reporter before a full POST.        |
| `GET`  | `/api/health`      | Health check.                                                        |
| `GET`  | `/api/logs/files`  | List log files with name, size, mtime, and line count.               |
| `GET`  | `/api/logs/events` | Read events from a file (`?file=<name \| all>`), flattened & sorted. |

## Highlights

- **Incremental tailing** — the active (still-append) log file is read by an
  incremental tailer that parses only newly appended bytes, avoiding full re-reads
  on every poll.
- **Immutable-rotated caching** — rotated files are parsed once and cached in an
  `@yukino.js/cache` group (LRU + single-flight), keyed by file size, mtime, and a
  hash of the file name.
- **Source-map resolution** — when enabled, minified stack frames are resolved back
  to original source locations using the client build's `.sourcemaps`.
- **Structured logging** — `pino`-based debug/info/error/warn loggers feeding the
  `log/` directory.

## Configuration

Configured via `config.yml` (schema-validated with `zod`):

```yaml
server:
  port: 8088
  body_limit: 1048576 # 1 MB
  allowed_origins: # CORS allow-list
    - "http://localhost:5173"

log:
  dir: ./logs
  max_size: 104857600
  file_prefix: sentry
  rotate_daily: true

sourcemap:
  enabled: true
  dir: ../client/dist/.sourcemaps
```

## Getting started

Run from the repository root:

```sh
pnpm install
pnpm server          # tsx watch src/index.ts
```

| Command                          | Description                    |
| -------------------------------- | ------------------------------ |
| `pnpm server`                    | Dev server (watch)             |
| `pnpm --filter server build`     | Bundle & obfuscate with Rollup |
| `pnpm --filter server start`     | Run bundled output             |
| `pnpm --filter server typecheck` | Type-check without emitting    |

The production build bundles `src/` into a single `dist/index.js`. Runtime
dependencies stay external in `node_modules`, while application code is
minified and obfuscated (`javascript-obfuscator`) with all strings moved into an
encoded string array. No source maps or declaration files are emitted, so
`dist/` contains no readable application source.

## Layout

```
server/
├── src/
│   ├── index.ts        # Koa app bootstrap (CORS + routes)
│   ├── routes.ts       # REST + SSE endpoints
│   ├── log-reader.ts   # read side of the log pipeline
│   ├── log-tailer.ts   # incremental active-file tailing
│   ├── source-map.ts   # minified frame -> source resolution
│   ├── logger.ts       # pino logger + JSONL writer
│   └── config.ts       # config.yml loading + zod validation
├── rollup.config.js    # single-file build + source protection
└── config.yml
```
