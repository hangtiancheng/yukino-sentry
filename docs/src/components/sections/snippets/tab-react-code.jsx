import { init } from "@yukino.js/sentry";
import { ReactErrorBoundary } from "@yukino.js/sentry/react";

init({ dsn: "/api/log", projectId: "react-app" });

export function App() {
  return (
    <ReactErrorBoundary fallback={(error) => <div>{error.message}</div>}>
      <Page />
    </ReactErrorBoundary>
  );
}
