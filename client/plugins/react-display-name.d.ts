import type { BabelFileResult } from "@babel/core";

export interface DisplayNameTransformResult {
  code: string;
  map: BabelFileResult["map"];
}

export function transformDisplayName(
  code: string,
  file: string,
): DisplayNameTransformResult | null;
