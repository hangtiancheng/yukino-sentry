// Node-only module: consumed by the vite subpath export, never bundled into the browser SDK.
// Resolves reported error positions using the dev server's in-memory module graph sourcemaps.

import {
  enrichReportData as enrichWithLoader,
  type MapLoader,
  splitScriptUrl,
} from "./source-map.js";

interface MinimalModuleNode {
  transformResult?: { map?: unknown } | null;
}

interface MinimalModuleGraph {
  getModuleByUrl(url: string): Promise<MinimalModuleNode | undefined>;
}

/** Structural subset of ViteDevServer, compatible with both vite and vite7. */
export interface ViteDevServerLike {
  moduleGraph: MinimalModuleGraph;
}

function createModuleGraphLoader(server: ViteDevServerLike): MapLoader {
  return async (url) => {
    const { pathname, search } = splitScriptUrl(url);
    const mod =
      (await server.moduleGraph.getModuleByUrl(pathname + search)) ??
      (await server.moduleGraph.getModuleByUrl(pathname));
    return mod?.transformResult?.map ?? null;
  };
}

export async function enrichReportData(
  server: ViteDevServerLike,
  records: unknown,
): Promise<unknown> {
  return enrichWithLoader(createModuleGraphLoader(server), records);
}
