import { enablePlugin } from "@yukino.js/sentry";
import {
  PerformancePlugin,
  ScreenRecordPlugin,
  ExposurePlugin,
} from "@yukino.js/sentry/plugins";

enablePlugin(
  new PerformancePlugin(),
  new ScreenRecordPlugin({ durationMs: 5000 }),
  new ExposurePlugin(),
);
