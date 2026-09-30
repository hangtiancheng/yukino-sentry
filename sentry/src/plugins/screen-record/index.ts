import { EventType, SentryPlugin } from "../../types";

import { sentry } from "../../utils";
import type { Cleanup } from "../../utils/decorate-prop.js";

import reporter from "../../reporter";

import { DEFAULT_OPTIONS } from "../../constants";

import { recorder } from "./recorder.js";

export interface ScreenRecordPluginOptions {
  durationMs?: number;
  eventTypes?: EventType[];
}

class ScreenRecordPlugin extends SentryPlugin {
  durationMs: number;
  eventTypes: EventType[];
  private cleanup: Cleanup | null = null;

  constructor(options: ScreenRecordPluginOptions = {}) {
    super();
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
    void recorder(reporter).then((cleanup) => {
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
