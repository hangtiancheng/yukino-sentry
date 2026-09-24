import { createRoot } from "@yukino.js/lit-jsx";

import { App } from "./app";
import { subscribe } from "@/lib/i18n";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

function renderApp(): void {
  root.render(<App />);
}

renderApp();
subscribe(renderApp);
