import { init, enablePlugin, traceError } from "@yukino.js/sentry";
import { PerformancePlugin } from "@yukino.js/sentry/plugins";

init({ dsn: "/api/log", projectId: "web" });
enablePlugin(new PerformancePlugin());

traceError(new Error("checkout failed"));
