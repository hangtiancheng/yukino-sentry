import { SentryPlugin, enablePlugin } from "@yukino.js/sentry";

class HeartbeatPlugin extends SentryPlugin {
  private timer: ReturnType<typeof setInterval> | null = null;

  init(): void {
    this.timer = setInterval(() => {
      // traceCustomEvent({ name: "Heartbeat", message: "alive" });
    }, 30_000);
  }

  override destroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

enablePlugin(new HeartbeatPlugin());
