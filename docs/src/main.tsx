import { createRoot } from "@yukino.js/lit-jsx";

import { App } from "./app";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

root.render(<App />);
