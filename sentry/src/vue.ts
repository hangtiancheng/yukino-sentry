import { type ComponentPublicInstance, type Plugin } from "vue";
import { init } from "./core/sdk-lifecycle.js";
import type { InitOptions } from "./core/options-schema.js";
import { EventType } from "./types/index.js";
import { reportFrameworkError } from "./core/framework-error.js";

export const vuePlugin: Plugin = (app, options: InitOptions) => {
  const handler = app.config.errorHandler;
  app.config.errorHandler = (
    err: unknown,
    vueInstance: ComponentPublicInstance | null,
    info: string,
  ) => {
    reportFrameworkError({
      type: EventType.Vue,
      error: err,
      context: {
        vueInstance,
        info,
      },
    });
    handler?.(err, vueInstance, info);
  };
  init(options);
};
