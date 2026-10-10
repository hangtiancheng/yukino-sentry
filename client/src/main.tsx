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
  enableHttpPerformance: true,
  excludeAPIs: [/\/api\/logs\//],
});
enablePlugin(new PerformancePlugin(), new ScreenRecordPlugin(), exposurePlugin);

startErrorSeeder();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("#root element is missing in index.html");

createRoot(rootElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
