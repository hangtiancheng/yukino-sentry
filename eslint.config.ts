import js from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";


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
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/consistent-generic-constructors": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "no-empty": "error",
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
    },
  },
]);
