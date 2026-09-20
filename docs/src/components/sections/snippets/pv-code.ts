// Automatic — no wiring required.
// PageLoad · HistoryChange · HashChange · PageDwell

import { tracePageView } from "@yukino.js/sentry";

tracePageView({
  name: "ProductDetail",
  message: location.href,
  extra: { productId: "sku-001" },
});
