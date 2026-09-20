import { traceCustomEvent, traceError } from "@yukino.js/sentry";

declare function pay(): Promise<void>;

traceCustomEvent({
  name: "CheckoutSuccess",
  message: "Submit order",
  extra: { orderId: "order-001" },
});

try {
  await pay();
} catch (error) {
  traceError(error);
}
