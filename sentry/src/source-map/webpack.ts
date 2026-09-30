// Node-only module: consumed by the webpack subpath export, never bundled into the browser SDK.
// Collects `.map` assets emitted by webpack (works with the in-memory dev-server file system)
// and resolves reported error positions against them.

import { type MapLoader, splitScriptUrl } from "./source-map.js";

export { enrichReportData, type MapLoader } from "./source-map.js";

interface AssetMapStore {
  /** Record an emitted asset; non-`.map` files are ignored. */
  put(file: string, content: string): void;
  /** MapLoader resolving reported script URLs against collected `.map` assets. */
  loadMap: MapLoader;
}

function normalizeAssetPath(file: string): string {
  return file.replace(/\\/g, "/").replace(/^\/+/, "");
}

export function createAssetMapStore(): AssetMapStore {
  const maps = new Map<string, string>();

  const put = (file: string, content: string): void => {
    const normalized = normalizeAssetPath(file);
    if (normalized.endsWith(".map")) {
      maps.set(normalized, content);
    }
  };

  const loadMap: MapLoader = async (url) => {
    const { pathname } = splitScriptUrl(url);
    const rel = normalizeAssetPath(pathname);
    if (!rel) return null;

    let raw = maps.get(`${rel}.map`);
    if (raw === undefined) {
      // publicPath prefixes are unknown here; fall back to basename matching
      const base = `${rel.split("/").pop()}.map`;
      for (const [file, content] of maps) {
        if (file === base || file.endsWith(`/${base}`)) {
          raw = content;
          break;
        }
      }
    }
    if (raw === undefined) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  return { put, loadMap };
}
