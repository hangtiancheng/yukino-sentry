import type { SentryPlugin } from "../types/index.js";

const plugins = new Set<SentryPlugin>();

export function registerPlugin(plugin: SentryPlugin): void {
  plugins.add(plugin);
}

export function destroyPlugins(): void {
  plugins.forEach((plugin) => {
    plugin.destroy?.();
  });
  plugins.clear();
}
