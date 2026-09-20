// vite.config.ts
import { defineConfig } from "vite";
import { sentryPlugin } from "@yukino.js/sentry/vite";

export default defineConfig({
  plugins: [sentryPlugin({ dsn: "/api/log" })],
});
