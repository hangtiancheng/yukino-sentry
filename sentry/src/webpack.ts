import type { IncomingMessage, ServerResponse } from "node:http";
import type { Compiler, WebpackPluginInstance } from "webpack";
import type DevServer from "webpack-dev-server";
import {
  closeLogStream,
  createLogStream,
  createMockMiddleware,
  DEFAULT_MOCK_DSN,
} from "./node/dev-endpoint.js";
import { createAssetMapStore, enrichReportData } from "./source-map/webpack.js";

export type SentryDevMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: DevServer.NextFunction,
) => void;

export interface ISentryWebpackPluginOptions {
  dsn?: string;
}

export function sentryMiddleware(
  options: ISentryWebpackPluginOptions = {},
): SentryDevMiddleware {
  const { fileStream, logFile } = createLogStream();
  console.log(
    `[@yukino.js/sentry] mock report endpoint active, logging to ${logFile}`,
  );
  return createMockMiddleware(options.dsn ?? DEFAULT_MOCK_DSN, fileStream);
}

export class SentryWebpackPlugin implements WebpackPluginInstance {
  private readonly dsn: string | undefined;

  constructor(options: ISentryWebpackPluginOptions = {}) {
    this.dsn = options.dsn;
  }

  apply(compiler: Compiler): void {
    if (!compiler.options.devServer) return;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const devServer = compiler.options.devServer as DevServer.Configuration;
    const { fileStream, logFile } = createLogStream();
    const mapStore = createAssetMapStore();
    const middleware = createMockMiddleware(
      this.dsn ?? DEFAULT_MOCK_DSN,
      fileStream,
      (records) => enrichReportData(mapStore.loadMap, records),
    );

    compiler.hooks.assetEmitted.tap(
      "SentryWebpackPlugin",
      (file, { content }) => {
        if (file.endsWith(".map")) {
          mapStore.put(file, content.toString("utf8"));
        }
      },
    );

    console.log(
      `[@yukino.js/sentry] mock report endpoint active, logging to ${logFile}`,
    );

    const userSetup = devServer.setupMiddlewares;
    devServer.setupMiddlewares = (middlewares, dev) => {
      const list = userSetup ? userSetup(middlewares, dev) : middlewares;
      const sentryEntry: DevServer.Middleware = {
        name: "sentry-mock",
        middleware,
      };
      list.unshift(sentryEntry);
      return list;
    };

    compiler.hooks.shutdown.tap("SentryWebpackPlugin", () => {
      closeLogStream(fileStream);
    });
  }
}

export function sentryPlugin(
  options: ISentryWebpackPluginOptions = {},
): SentryWebpackPlugin {
  return new SentryWebpackPlugin(options);
}

export default sentryPlugin;
