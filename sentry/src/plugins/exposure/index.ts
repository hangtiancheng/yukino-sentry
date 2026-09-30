import { EventType, SentryPlugin, Status } from "../../types/index.js";
import reporter from "../../reporter/index.js";
import { getBaseData, sentryLogger } from "../../utils/index.js";
import { z } from "zod";

const exposureTargetSchema = z.object({
  target: z.custom<Element>(
    (value) => "Element" in globalThis && value instanceof globalThis.Element,
  ),
  threshold: z.number().min(0).max(1).optional(),
  params: z.record(z.string(), z.unknown()).optional(),
});

type ExposureTarget = z.infer<typeof exposureTargetSchema>;

interface ExposureState {
  readonly threshold: number;
  readonly observeTime: number;
  showTime?: number;
  readonly params: Readonly<Record<string, unknown>>;
}

class ExposurePlugin extends SentryPlugin {
  private ioMap = new Map<number, IntersectionObserver>();
  private targetMap = new Map<Element, ExposureState>();

  init() {
    sentryLogger.info("Exposure plugin initialized");
  }

  private initObserver(threshold: number): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const targetObj = this.targetMap.get(entry.target);
          if (!targetObj) return;

          if (entry.isIntersecting) {
            targetObj.showTime = Date.now();
          } else {
            if (!targetObj.showTime) return;
            const showEndTime = Date.now();
            this.sendEvent(targetObj, showEndTime);
            delete targetObj.showTime;
          }
        });
      },
      { threshold },
    );
  }

  private sendEvent(targetObj: ExposureState, showEndTime: number): void {
    if (!targetObj.showTime) {
      return;
    }
    reporter.send({
      ...getBaseData(),
      type: EventType.Exposure,
      name: "Exposure",
      message: "Element Exposure",
      status: Status.OK,
      extra: {
        threshold: targetObj.threshold,
        observeTime: targetObj.observeTime,
        showTime: targetObj.showTime,
        showEndTime,
        duration: showEndTime - targetObj.showTime,
        params: targetObj.params,
      },
    });
  }

  public observe(targets: ExposureTarget | readonly ExposureTarget[]): void {
    const inputList = Array.isArray(targets) ? targets : [targets];
    const list = inputList.map((item) => exposureTargetSchema.parse(item));
    list.forEach((item) => {
      const threshold = item.threshold ?? 0.5;
      const observer =
        this.ioMap.get(threshold) ?? this.initObserver(threshold);
      this.ioMap.set(threshold, observer);

      if (!this.targetMap.has(item.target)) {
        observer.observe(item.target);
        this.targetMap.set(item.target, {
          threshold,
          observeTime: Date.now(),
          params: item.params ?? {},
        });
      }
    });
  }

  public unobserve(targets: Element | readonly Element[]): void {
    const inputList = Array.isArray(targets) ? targets : [targets];
    inputList.forEach((target) => this.unobserveOne(target));
  }

  private unobserveOne(target: Element): void {
    const targetObj = this.targetMap.get(target);
    if (!targetObj) return;

    const io = this.ioMap.get(targetObj.threshold);
    if (io) {
      io.unobserve(target);
    }
    this.targetMap.delete(target);
  }

  public override destroy(): void {
    this.ioMap.forEach((observer) => {
      observer.disconnect();
    });
    this.ioMap.clear();
    this.targetMap.clear();
  }
}

export default ExposurePlugin;
