import js from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
// import { dirname } from "node:path";
// import { fileURLToPath } from "node:url";

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename);

export default defineConfig([
  globalIgnores([
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
    "client/src/components/ui/**",
  ]),
  {
    files: [
      "client/**/*.{ts,tsx}",
      "sentry/**/*.{ts,tsx}",
      "server/**/*.{ts,tsx}",
    ],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      unicorn,
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        // Runtime boundaries must use zod validation instead of type assertions.
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      // "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      // "@typescript-eslint/no-unsafe-argument": "error",
      // "@typescript-eslint/no-unsafe-assignment": "error",
      // "@typescript-eslint/no-unsafe-call": "error",
      // "@typescript-eslint/no-unsafe-enum-comparison": "error",
      // "@typescript-eslint/no-unsafe-member-access": "error",
      // "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/consistent-generic-constructors": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "no-empty": "error",
      // "no-unused-vars": "error",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
    },
  },
]);
