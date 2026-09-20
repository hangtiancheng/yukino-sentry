import { enablePlugin } from "@yukino.js/sentry";
import { ExposurePlugin } from "@yukino.js/sentry/plugins";

const exposure = new ExposurePlugin();
enablePlugin(exposure);

exposure.observe({
  target: document.querySelector("#banner")!,
  threshold: 0.5,
  params: { bannerId: "spring-001" },
});
