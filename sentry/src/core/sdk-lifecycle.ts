import { DEFAULT_OPTIONS } from "../constants/index.js";
import type { SentryPlugin } from "../types/index.js";
import { sentry, sentryLogger } from "../utils/index.js";
import type { Cleanup } from "../utils/decorate-prop.js";
import { initIdentity } from "./identity.js";
import breadcrumb from "./breadcrumb.js";
import { optionsSchema, type InitOptions } from "./options-schema.js";
import { destroyPlugins, registerPlugin } from "./plugin-registry.js";
import setup from "./setup.js";
import { destroyBatchErrorManager } from "./handle-code-error.js";
import { resetReporter } from "../reporter/index.js";

let cleanupSetup: Cleanup | null = null;

export function isInitialized(): boolean {
  return cleanupSetup !== null;
}

export function destroy(): void {
  destroyPlugins();
  cleanupSetup?.();
  cleanupSetup = null;
  destroyBatchErrorManager();
  resetReporter();
  breadcrumb.clear();
  sentry.codeErrors.clear();
  sentry.shouldScreenRecord = false;
}

export function init(options: InitOptions): void {
  if (isInitialized()) {
    sentryLogger.info("SDK already initialized");
    return;
  }
  // Explicitly-undefined values must not clobber defaults during the merge.
  const provided = Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined),
  );
  const parsedOptions = optionsSchema.parse({
    ...DEFAULT_OPTIONS,
    ...provided,
  });
  sentry.setOptions(parsedOptions);
  const { dsn } = sentry.options;
  if (sentry.options.disabled) {
    sentryLogger.info("SDK disabled by options");
    return;
  }
  if (dsn === "") {
    sentryLogger.error("Initialization failed: DSN is empty");
    return;
  }
  sentryLogger.info("SDK initialized", {
    options: sentry.options,
  });
  breadcrumb.capacity = sentry.options.maxBreadcrumbs;
  cleanupSetup = setup();
  void initIdentity();
}

export function enablePlugin(...plugins: SentryPlugin[]): void {
  for (const plugin of plugins) {
    plugin.init();
    registerPlugin(plugin);
  }
}
