import type { Plugin } from "vite";
import { transformDisplayName } from "./react-display-name.js";

/**
 * Build-only transform that injects `X.displayName = "X";` after every
 * top-level React component (see ./react-display-name.js for the rules),
 * so component names survive minification.
 *
 * Runs with `enforce: "pre"` to see the original TSX before the oxc JSX
 * transform configured by @vitejs/plugin-react.
 */
export default function reactDisplayName(): Plugin {
  return {
    name: "vite-plugin-react-display-name",
    enforce: "pre",
    apply: "build",
    transform(code, id) {
      return transformDisplayName(code, id.split("?", 1)[0]);
    },
  };
}
