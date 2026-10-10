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
