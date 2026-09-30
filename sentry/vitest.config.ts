import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(dirname(fileURLToPath(new URL(import.meta.url))), "src"),
    },
  },
});
