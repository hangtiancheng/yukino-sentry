import {
  init,
  beforeSend,
  beforeSendBatch,
  afterSend,
} from "@yukino.js/sentry";

init({
  dsn: "/api/log",
  cacheMaxLength: 10, // flush when 10 events queue up
  cacheWaitingTime: 2000, // or after 2s, whichever first
  maxQueueLength: 200, // cap while offline
  ignoreErrors: [/ResizeObserver loop limit exceeded/],
  excludeAPIs: ["/api/log", /\/health$/],
});

beforeSend((event) => {
  if (event.type === "Click") return false; // drop entirely
  return event;
});

beforeSendBatch((batch) => batch.filter((e) => e.status !== "OK"));
afterSend((batch) => console.log("sent", batch.length));
