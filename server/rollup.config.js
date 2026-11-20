import { readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import typescript from "@rollup/plugin-typescript";
import JavaScriptObfuscator from "javascript-obfuscator";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
);

const external = new Set([
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
  ...Object.keys(pkg.dependencies ?? {}),
]);

function protectSource() {
  return {
    name: "protect-source",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") continue;
        output.code = JavaScriptObfuscator.obfuscate(output.code, {
          target: "node",
          compact: true,
          comments: false,
          sourceMap: false,
          identifierNamesGenerator: "hexadecimal",
          renameGlobals: true,
          stringArray: true,
          stringArrayThreshold: 1,
          stringArrayEncoding: ["base64"],
          stringArrayRotate: true,
          stringArrayShuffle: true,
          splitStrings: true,
          splitStringsChunkLength: 8,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          selfDefending: true,
          debugProtection: false,
          disableConsoleOutput: false,
        }).getObfuscatedCode();
      }
    },
  };
}

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: false,
  },
  external: [...external],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      compilerOptions: {
        module: "ESNext",
        moduleResolution: "Bundler",
        outDir: "dist",
        declaration: false,
        sourceMap: false,
        inlineSources: false,
        noEmitOnError: true,
      },
    }),
    protectSource(),
  ],
};
