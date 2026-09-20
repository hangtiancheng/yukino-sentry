import { init, enablePlugin } from "@yukino.js/sentry";
import { PerformancePlugin } from "@yukino.js/sentry/plugins";

init({ dsn: "/api/log", projectId: "vanilla-app" });

enablePlugin(new PerformancePlugin());
