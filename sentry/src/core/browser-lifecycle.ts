import { initIdentity } from "./browser-identity.js";
import { createSdkLifecycle } from "./sdk-lifecycle.js";
import setup from "./setup.js";

const lifecycle = createSdkLifecycle({
  setup,
  onInitialized: () => {
    void initIdentity();
  },
});

export const { init, destroy, isInitialized, enablePlugin } = lifecycle;
