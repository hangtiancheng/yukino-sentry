import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import pageRoutes from "./plugins/vite-plugin-page-routes";
import reactDisplayName from "./plugins/vite-plugin-react-display-name";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { join, resolve } from "node:path";

function moveSourcemaps(): Plugin {
  let outDir = "dist";
  return {
    name: "move-sourcemaps",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const mapDir = join(outDir, ".sourcemaps");
      const mapFiles: string[] = [];
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            if (fullPath !== mapDir) walk(fullPath);
          } else if (entry.name.endsWith(".map")) {
            mapFiles.push(fullPath);
          }
        }
      };
      walk(outDir);
      if (mapFiles.length === 0) return;
      mkdirSync(mapDir, { recursive: true });
      for (const file of mapFiles) {
        renameSync(file, join(mapDir, file.slice(file.lastIndexOf("/") + 1)));
      }
      this.info(`moved ${mapFiles.length} sourcemap file(s) to ${mapDir}`);
    },
  };
}

export default defineConfig({
  plugins: [
    pageRoutes(),
    reactDisplayName(),
    react(),
    tailwindcss(),
    moveSourcemaps(),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  optimizeDeps: {
    exclude: ["@yukino.js/sentry"],
  },
  build: {
    sourcemap: "hidden",
  },
  server: {
    proxy: {
      "/api": { target: "http://localhost:8088", changeOrigin: true },
      "/static": { target: "http://localhost:8088", changeOrigin: true },
    },
  },
});
