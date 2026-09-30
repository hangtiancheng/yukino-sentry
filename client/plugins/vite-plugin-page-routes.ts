import { join } from "node:path";
import type { Plugin } from "vite";
import { generateRoutes } from "./page-routes.js";

export default function pageRoutes(): Plugin {
  let root = process.cwd();

  return {
    name: "vite-plugin-page-routes",

    configResolved(config) {
      root = config.root;
    },

    buildStart() {
      const pagesDir = join(root, "src", "pages");
      const outputFile = join(root, "src", "generated", "routes.tsx");
      generateRoutes(pagesDir, outputFile);
    },

    configureServer(server) {
      const pagesDir = join(root, "src", "pages");
      const outputFile = join(root, "src", "generated", "routes.tsx");

      server.watcher.add(pagesDir);
      server.watcher.on("all", (event, filePath) => {
        if (!filePath.startsWith(pagesDir)) return;
        if (event === "add" || event === "unlink") {
          generateRoutes(pagesDir, outputFile);
        }
      });
    },
  };
}
