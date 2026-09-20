import { enablePlugin, tracePerformance } from "@yukino.js/sentry";
import { PerformancePlugin } from "@yukino.js/sentry/plugins";

enablePlugin(new PerformancePlugin());

tracePerformance({
  name: "SearchLatency",
  message: "/api/search",
  value: 128,
});
