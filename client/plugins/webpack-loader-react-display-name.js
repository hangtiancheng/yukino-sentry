// @ts-check

import { transformDisplayName } from "./react-display-name.js";

/**
 * Webpack loader counterpart of the vite plugin: injects
 * `X.displayName = "X";` after every top-level React component (see
 * ./react-display-name.js for the rules). Place it AFTER esbuild-loader in
 * the `use` array so it runs first, on the original TSX source.
 *
 * @this {import("webpack").LoaderContext<unknown>}
 * @param {string} source - Raw module source handed to the first loader.
 * @returns {string | void} The untouched source when the file is out of
 *   scope; otherwise the transformed code and its sourcemap are emitted
 *   through `this.callback`.
 */
export default function reactDisplayNameLoader(source) {
  const result = transformDisplayName(source, this.resourcePath);
  if (!result) return source;
  this.callback(null, result.code, result.map ?? undefined);
}
