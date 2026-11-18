import { EventType, SentryPlugin } from "../../types";

import { sentry } from "../../utils";
import type { Cleanup } from "../../utils/decorate-prop.js";

import reporter from "../../reporter";

import { DEFAULT_OPTIONS } from "../../constants";

import { recorder, type ScreenRecordPrivacyOptions } from "./recorder.js";

export type { ScreenRecordPrivacyOptions } from "./recorder.js";

export interface ScreenRecordPluginOptions {
  durationMs?: number;
  eventTypes?: EventType[];
  /** rrweb privacy options; overrides the plugin's conservative defaults. */
  recordOptions?: ScreenRecordPrivacyOptions;
}

class ScreenRecordPlugin extends SentryPlugin {
  durationMs: number;
  eventTypes: EventType[];
  private readonly recordOptions: ScreenRecordPrivacyOptions;
  private cleanup: Cleanup | null = null;

  constructor(options: ScreenRecordPluginOptions = {}) {
    super();
    this.recordOptions = { ...options.recordOptions };
    this.durationMs =
      options.durationMs ?? DEFAULT_OPTIONS.screenRecordDurationMs;
    this.eventTypes = [
      ...(options.eventTypes ?? DEFAULT_OPTIONS.screenRecordEventTypes),
    ];
  }

  init() {
    sentry.setOptions({
      screenRecordEventTypes: [...this.eventTypes],
      screenRecordDurationMs: this.durationMs,
    });
    void recorder(reporter, this.recordOptions).then((cleanup) => {
      this.cleanup = cleanup;
    });
  }

  override destroy(): void {
    this.cleanup?.();
    this.cleanup = null;
  }
}

export default ScreenRecordPlugin;
export { unzipScreenRecord } from "./recorder.js";
