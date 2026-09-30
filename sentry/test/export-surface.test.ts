import { describe, expect, it } from "vitest";

import * as root from "@/index.js";
import ExposurePlugin from "@/plugins/exposure/index.js";
import PerformancePlugin from "@/plugins/performance/index.js";
import ScreenRecordPlugin, {
  unzipScreenRecord,
} from "@/plugins/screen-record/index.js";
import { ReactErrorBoundary } from "@/react.js";
import { vuePlugin } from "@/vue.js";

describe("export surface", () => {
  it("keeps the root entry framework agnostic", () => {
    expect(root.init).toBeTypeOf("function");
    expect(root.enablePlugin).toBeTypeOf("function");
    expect(root.destroy).toBeTypeOf("function");
    expect(root.traceError).toBeTypeOf("function");
    expect(Object.hasOwn(root, "ReactErrorBoundary")).toBe(false);
    expect(Object.hasOwn(root, "vuePlugin")).toBe(false);
  });

  it("exports plugin and framework subpath entries", () => {
    expect(PerformancePlugin).toBeTypeOf("function");
    expect(ScreenRecordPlugin).toBeTypeOf("function");
    expect(unzipScreenRecord).toBeTypeOf("function");
    expect(ExposurePlugin).toBeTypeOf("function");
    expect(ReactErrorBoundary).toBeTypeOf("function");
    expect(vuePlugin).toBeTypeOf("function");
  });
});
