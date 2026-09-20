/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
