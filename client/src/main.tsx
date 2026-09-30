import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./app.tsx";

import { enablePlugin, init } from "@yukino.js/sentry";
import {
  PerformancePlugin,
  ScreenRecordPlugin,
} from "@yukino.js/sentry/plugins";
import { exposurePlugin } from "./lib/exposure";
import { startErrorSeeder } from "./crash/seeder";

document.documentElement.classList.toggle(
  "dark",
  localStorage.getItem("dashboard-theme") !== "light",
);

init({
  dsn: "/api/log",
  debug: true,
  // Report successful fetch/XHR as Performance "HTTP <method>" events so the
  // network page can compute a real failure rate (errors are always reported).
  enableHttpPerformance: true,
  // Don't monitor the dashboard's own log polling: self-reported polls would
  // grow the log on every refresh and defeat the events endpoint's ETag/304.
  excludeAPIs: [/\/api\/logs\//],
});
enablePlugin(new PerformancePlugin(), new ScreenRecordPlugin(), exposurePlugin);

// Plant probabilistic errors of every SDK-collectible type (must run after
// init so the capture listeners are already installed). See ./dev/error-seeder.
startErrorSeeder();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("#root element is missing in index.html");

createRoot(rootElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
