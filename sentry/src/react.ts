import { Component, type ErrorInfo, type ReactNode } from "react";
import { EventType } from "./types/index.js";
import { reportFrameworkError } from "./core/framework-error.js";

export interface ReactErrorBoundaryProps {
  readonly children?: ReactNode;

  /**
   * Error UI. A render function may be called once with `errorInfo`
   * undefined (the fallback renders from `getDerivedStateFromError` before
   * React delivers `ErrorInfo` in `componentDidCatch`) and again once it is
   * available.
   */
  readonly fallback?:
    ReactNode | ((error: Error, errorInfo?: ErrorInfo) => ReactNode);
}

interface ReactErrorBoundaryState {
  readonly error?: Error;
  readonly errorInfo?: ErrorInfo;
}

/**
 * React Error Boundary that renders `fallback` and reports the caught error
 * to the SDK as an `EventType.React` event.
 */
export class ReactErrorBoundary extends Component<
  ReactErrorBoundaryProps,
  ReactErrorBoundaryState
> {
  // Keeps the React 16 component stack readable.
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
