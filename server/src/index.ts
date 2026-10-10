import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@koa/cors";
import Koa from "koa";
import { cfg } from "./config.js";
import { logger } from "./logger.js";
import { registerRoutes } from "./routes.js";
import { initLogCache, destroyLogCache } from "./log-reader.js";
import { initSourcemap, destroySourcemap } from "./source-map.js";

const app = new Koa();

async function startup() {
  const filename__ = fileURLToPath(import.meta.url);
  const dirname__ = dirname(filename__);
  console.log("filename__", filename__);
  console.log("dirname__", dirname__);

  const configPath = join(dirname__, "../config.yml");
  try {
    cfg.load(configPath);
  } catch (error) {
    console.error(`Failed to load config: ${error}`);
    process.exit(1);
  }

  try {
    logger.init();
  } catch (error) {
    console.error(`Failed to init logger: ${error}`);
    process.exit(1);
  }

  const infoLogger = logger.getInfoLogger();
  if (infoLogger) {
    infoLogger.info("Server starting...");
  }

  initLogCache();

  initSourcemap(cfg.getConfig().sourcemap);
  if (infoLogger && cfg.getConfig().sourcemap.enabled) {
    infoLogger.info(
      `Sourcemap resolution enabled, dir: ${cfg.getConfig().sourcemap.dir}`,
    );
  }

  const allowedOrigins = cfg.getConfig().server.allowed_origins;
  app.use(
    cors({
      origin: (ctx) => {
        const origin = ctx.request.header.origin;
        if (!origin) return "*";
        if (allowedOrigins.includes("*")) {
          return "*";
        }
        if (allowedOrigins.includes(origin)) {
          return origin;
        }
        return "";
      },
      allowMethods: ["POST", "OPTIONS", "GET", "HEAD"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  );

  registerRoutes(app);

  const port = cfg.getConfig().server.port;
  let server: ReturnType<typeof app.listen>;
  try {
    server = app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${port}`);
      if (infoLogger) {
        infoLogger.info(`Server started on port ${port}`);
      }
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    await shutdown();
  });

  process.on("SIGTERM", async () => {
    await shutdown();
  });

  process.on("uncaughtException", (err) => {
    console.error(err);
    process.exit(1);
  });

  async function shutdown() {
    if (infoLogger) {
      infoLogger.info("Shutting down...");
    }

    if (server) {
      server.close();
    }

    destroyLogCache();
    destroySourcemap();
    logger.close();

    if (infoLogger) {
      infoLogger.info("Server stopped");
    }
    process.exit(0);
  }
}

startup();
