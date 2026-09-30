// @ts-check

import { join } from "node:path";
import { generateRoutes } from "./page-routes.js";

const PLUGIN_NAME = "PageRoutesPlugin";

export default class PageRoutesPlugin {
  /** @param {import("webpack").Compiler} compiler */
  apply(compiler) {
    const pagesDir = join(compiler.context, "src", "pages");
    const outputFile = join(compiler.context, "src", "generated", "routes.tsx");

    compiler.hooks.beforeCompile.tap(PLUGIN_NAME, () => {
      generateRoutes(pagesDir, outputFile);
    });

    compiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
      compilation.contextDependencies.add(pagesDir);
    });
  }
}
