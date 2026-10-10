import { z } from "zod";

import { EventType, type BeforeSendHook, type IOptions } from "../types";

const beforeSendHookSchema = z.custom<BeforeSendHook>(
  (value: unknown) => typeof value === "function",
  "Expected a before-send hook function",
);

const beforeBreadcrumbHookSchema = z.custom<IOptions["beforeBreadcrumb"]>(
  (value: unknown) => typeof value === "function",
  "Expected a breadcrumb hook function",
);

const beforeSendBatchHookSchema = z.custom<IOptions["beforeSendBatch"]>(
  (value: unknown) => typeof value === "function",
  "Expected a before-send-batch hook function",
);

const afterSendHookSchema = z.custom<IOptions["afterSend"]>(
  (value: unknown) => typeof value === "function",
  "Expected an after-send hook function",
);

const stringOrRegExpSchema = z.union([z.string(), z.instanceof(RegExp)]);

export const optionsSchema = z.object({
  dsn: z.string(),
  projectId: z.string(),
  disabled: z.boolean(),
  userId: z.string(),
  enableXhr: z.boolean(),
  enableFetch: z.boolean(),
  enableClick: z.boolean(),
  enableError: z.boolean(),
  enableUnhandledRejection: z.boolean(),
  enableHashChange: z.boolean(),
  enableHistory: z.boolean(),
  enableWhiteScreen: z.boolean(),
  enableFingerprint: z.boolean(),
  anonymousId: z.string(),
  visitorId: z.string(),
  screenRecordDurationMs: z.number().nonnegative(),
  screenRecordEventTypes: z.array(z.enum(EventType)),
  hasSkeleton: z.boolean(),
  rootCssSelectors: z.array(z.string()),
  clickThrottleDelay: z.number().nonnegative(),
  maxBreadcrumbs: z.number().int().positive(),
  repeatCodeError: z.boolean(),
  enableHttpPerformance: z.boolean(),
  ignoreErrors: z.array(stringOrRegExpSchema),
  excludeAPIs: z.array(stringOrRegExpSchema),
  beforeBreadcrumb: beforeBreadcrumbHookSchema.optional(),
  cacheMaxLength: z.number().int().positive(),
  cacheWaitingTime: z.number().nonnegative(),
  maxQueueLength: z.number().int().positive(),
  retryIntervalMilliseconds: z.number().nonnegative(),
  beforeSend: beforeSendHookSchema.optional(),
  beforeSendBatch: beforeSendBatchHookSchema.optional(),
  afterSend: afterSendHookSchema.optional(),
  offlineCacheKey: z.string(),
  tracesSampleRate: z.number().min(0).max(1),
  debug: z.boolean(),
});

type Options = z.input<typeof optionsSchema>;
export type InitOptions = {
  [K in keyof Options]?: Options[K] | undefined;
} & Pick<Options, "dsn">;
