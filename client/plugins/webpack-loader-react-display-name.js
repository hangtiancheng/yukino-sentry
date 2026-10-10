// @ts-check

import { transformDisplayName } from "./react-display-name.js";

export default function reactDisplayNameLoader(source) {
  const result = transformDisplayName(source, this.resourcePath);
  if (!result) return source;
  this.callback(null, result.code, result.map ?? undefined);
}
