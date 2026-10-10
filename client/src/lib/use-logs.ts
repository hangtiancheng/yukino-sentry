import { createContext, useContext } from "react";
import type { LogFileInfo, ReportEvent } from "./log-types";

export const REFRESH_CHOICES = [
  { value: "5000", label: "Refresh every 5s" },
  { value: "15000", label: "Refresh every 15s" },
  { value: "60000", label: "Refresh every 1min" },
  { value: "0", label: "Pause auto-refresh" },
] as const;

export interface LogsContextValue {
  files: LogFileInfo[];
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  refreshMs: number;
  setRefreshMs: (ms: number) => void;
  events: ReportEvent[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

export const LogsContext = createContext<LogsContextValue | null>(null);

export function useLogs(): LogsContextValue {
  const context = useContext(LogsContext);
  if (!context) throw new Error("useLogs must be used within <LogsProvider>");
  return context;
}
