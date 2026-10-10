import { Component, type ErrorInfo, type ReactNode } from "react";
import { EventType } from "./types/index.js";
import { reportFrameworkError } from "./core/framework-error.js";

export interface ReactErrorBoundaryProps {
  readonly children?: ReactNode;

  readonly fallback?:
    ReactNode | ((error: Error, errorInfo?: ErrorInfo) => ReactNode);
}

interface ReactErrorBoundaryState {
  readonly error?: Error;
  readonly errorInfo?: ErrorInfo;
}

export class ReactErrorBoundary extends Component<
  ReactErrorBoundaryProps,
  ReactErrorBoundaryState
> {
  static displayName = "ReactErrorBoundary";

  override state: ReactErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ReactErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    reportFrameworkError({
      type: EventType.React,
      error,
      context: errorInfo,
    });
  }

  override render(): ReactNode {
    const { error, errorInfo } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback(error, errorInfo);
      }
      return fallback ?? null;
    }
    return this.props.children ?? null;
  }
}
