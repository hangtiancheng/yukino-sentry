import { defineConfig, type Plugin } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { cpSync, rmSync } from "node:fs";
import dts from "rollup-plugin-dts";
import { fileURLToPath } from "node:url";

const external = [
  /^node:/,
  "@fingerprintjs/fingerprintjs",
  "@rrweb/record",
  "pako",
  "react",
  "source-map",
  "ua-parser-js",
  "vite",
  "vue",
  "web-vitals",
  "webpack",
  "zod",
];

const distDir = fileURLToPath(new URL("dist", import.meta.url));
const srcSkill = fileURLToPath(
  new URL("../.agents/skills/yukino-sentry", import.meta.url),
);
const destSkill = fileURLToPath(
  new URL("skills/yukino-sentry", import.meta.url),
);

function cleanThenInstall(): Plugin {
  return {
    name: "clean-then-install",
    buildStart() {
      rmSync(distDir, { recursive: true, force: true });
    },
    buildEnd() {
      cpSync(srcSkill, destSkill, {
        recursive: true,
        force: true,
        errorOnExist: false,
      });
    },
  };
}

export default defineConfig([
  {
    input: {
      index: "./src/index.ts",
      react: "./src/react.ts",
      vue: "./src/vue.ts",
      vite: "./src/vite.ts",
      webpack: "./src/webpack.ts",
      "plugins/index": "./src/plugins/index.ts",
    },
    output: [
      {
        dir: "./dist",
        format: "esm",
        exports: "named",
        preserveModules: true,
        preserveModulesRoot: "./src",
        plugins: [terser()],
      },
      {
        dir: "./dist",
        format: "cjs",
        exports: "named",
        preserveModules: true,
        preserveModulesRoot: "./src",
        entryFileNames: "[name].cjs",
        plugins: [terser()],
      },
    ],
    plugins: [
      cleanThenInstall(),
      nodeResolve({
        extensions: [".js", ".json"],
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
      }),
    ],
    external,
  },
  {
    input: {
      index: "./src/index.ts",
      react: "./src/react.ts",
      vue: "./src/vue.ts",
      vite: "./src/vite.ts",
      webpack: "./src/webpack.ts",
      "plugins/index": "./src/plugins/index.ts",
    },
    output: {
      dir: "./dist",
      format: "esm",
      exports: "named",
      preserveModules: true,
      preserveModulesRoot: "./src",
    },
    external,
    plugins: [dts()],
  },
]);
