import {
  EventType,
  type IPerformanceData,
  type TOnReportPerformanceData,
} from "../../types";

import {
  onCLS,
  onFCP,
  onINP,
  onLCP,
  onTTFB,
  type CLSMetric,
  type FCPMetric,
  type INPMetric,
  type LCPMetric,
  type TTFBMetric,
} from "web-vitals";

import { getBaseData, metric2perfData, sentryLogger } from "../../utils";
import type { Cleanup } from "../../utils/decorate-prop.js";
import { getFirstScreenPaint } from "./first-screen-paint.js";

function getMetricDuration(data: IPerformanceData): number | undefined {
  if ("value" in data && typeof data.value === "number") {
    return Math.round(data.value);
  }
  return undefined;
}

export function getWebVitals(onReport: TOnReportPerformanceData): Cleanup {
  sentryLogger.info("Starting web vitals monitoring...");

  const reportAndLog = (data: IPerformanceData) => {
    sentryLogger.success(`Metric: ${data.name}`, data, getMetricDuration(data));
    onReport(data);
  };

  onLCP((metric: LCPMetric) => {
    reportAndLog(metric2perfData(metric));
  });

  onFCP((metric: FCPMetric) => {
    reportAndLog(metric2perfData(metric));
  });

  onCLS((metric: CLSMetric) => {
    reportAndLog(metric2perfData(metric));
  });

  onINP((metric: INPMetric) => {
    reportAndLog(metric2perfData(metric));
  });

  onTTFB((metric: TTFBMetric) => {
    reportAndLog(metric2perfData(metric));
  });

  return getFirstScreenPaint((value: number) => {
    const perfData: IPerformanceData = {
      ...getBaseData(),
      name: "FSP",
      value,
      type: EventType.Performance,
      message: "First screen paint",
    };
    reportAndLog(perfData);
  });
}
