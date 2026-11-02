import { join } from "node:path";
import { generateRoutes } from "../plugins/page-routes.js";

const root = join(import.meta.dirname, "..");

generateRoutes(
  join(root, "src", "pages"),
  join(root, "src", "generated", "routes.tsx"),
);
