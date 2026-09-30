import { EventType, type IPerformanceData } from "../types";

import getBaseData from "./get-base-data.js";

import type { Metric } from "web-vitals";

function metric2perfData(metric: Metric): IPerformanceData {
  const { id, name, value, rating } = metric;
  return {
    ...getBaseData(),
    id,
    name,
    value,
    rating,
    type: EventType.Performance,
  };
}

export default metric2perfData;
