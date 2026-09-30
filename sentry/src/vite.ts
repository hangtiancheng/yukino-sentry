// npm view vite versions
// pnpm add -D vite7@npm:vite@7
// pnpm add -D vite

import { type Plugin } from "vite";
import {
  closeLogStream,
  createLogStream,
  createMockMiddleware,
  DEFAULT_MOCK_DSN,
  type LogStreamHandle,
  type MockMiddleware,
} from "./node/dev-endpoint.js";
import { enrichReportData, type ViteDevServerLike } from "./source-map/vite.js";

export interface ISentryPluginOptions {
  dsn?: string;
}

interface SentryViteServer extends ViteDevServerLike {
  middlewares: { use(handler: MockMiddleware): unknown };
}

function buildPlugin({ dsn }: ISentryPluginOptions) {
  const url = dsn ?? DEFAULT_MOCK_DSN;
  let logStream: LogStreamHandle | null = null;
  return {
    name: "vite-plugin-sentry",
    apply: "serve" as const,
    configureServer(server: SentryViteServer) {
      logStream = createLogStream();
      console.log(
        `[@yukino.js/sentry] mock report endpoint active, logging to ${logStream.logFile}`,
      );
      server.middlewares.use(
        createMockMiddleware(url, logStream.fileStream, (records) =>
          enrichReportData(server, records),
        ),
      );
    },
    closeBundle() {
      if (logStream) closeLogStream(logStream.fileStream);
    },
  };
}

export function sentryPlugin(options: ISentryPluginOptions = {}): Plugin {
  return buildPlugin(options);
}

export default sentryPlugin;
