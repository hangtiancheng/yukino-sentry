import type { Plugin } from "vite";
import { transformDisplayName } from "./react-display-name.js";

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
