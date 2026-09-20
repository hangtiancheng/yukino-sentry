import { Icon } from "@/components/icons/icon";
import { Section } from "@/components/ui/section";
import { STEP1_CODE, STEP2_CODE, STEP3_CODE } from "./snippets";
import { card, faint, heading, muted } from "@/lib/styles";

interface Step {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly code: string;
  readonly filename: string;
}

const STEPS: readonly Step[] = [
  {
    icon: "package",
    title: "Install the SDK",
    description:
      "One package. React, Vue, Vite and webpack are optional peers you only install when you use them.",
    filename: "terminal",
    code: "npm install @yukino.js/sentry",
  },
  {
    icon: "radio",
    title: "Initialize once",
    description:
      "Point the SDK at your report endpoint. Everything else falls back to sensible defaults.",
    filename: "src/main.ts",
    code: STEP1_CODE,
  },
  {
    icon: "plug",
    title: "Enable the plugins you need",
    description:
      "Performance, screen recording and exposure tracking are opt-in and tree-shakeable.",
    filename: "src/plugins.ts",
    code: STEP2_CODE,
  },
  {
    icon: "wand-sparkles",
    title: "Trace your own events",
    description:
      "Send business events, timings and manual errors with the same pipeline and hooks.",
    filename: "src/checkout.ts",
    code: STEP3_CODE,
  },
];

export function QuickStart() {
  return (
    <Section
      id="quickstart"
      eyebrow="Quick start"
      title="From zero to production"
      accent="in four steps."
      description="No agent, no config file, no build plugin required. This is the entire happy path."
    >
      <ui-reveal-list className="grid gap-6 lg:grid-cols-2">
        {STEPS.map((step, index) => (
          <ui-reveal-item key={step.title} className="h-full">
            <div className={`${card} flex h-full flex-col rounded-3xl p-6`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="from-brand-500 to-accent-500 shadow-brand-500/25 relative grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-lg font-black text-white shadow-lg">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3
                    className={`flex items-center gap-2 font-bold ${heading}`}
                  >
                    <Icon
                      name={step.icon}
                      className="text-brand-500 dark:text-brand-300 size-4 shrink-0"
                    />
                    {step.title}
                  </h3>
                  <p className={`mt-0.5 text-sm ${faint}`}>
                    {step.description}
                  </p>
                </div>
              </div>
              <div className="mt-0">
                <code-block code={step.code} filename={step.filename} />
              </div>
            </div>
          </ui-reveal-item>
        ))}
      </ui-reveal-list>

      <ui-reveal delay={0.15} className="mt-8">
        <div className="border-brand-400/40 from-brand-500/10 to-accent-500/10 rounded-3xl border bg-linear-to-r via-transparent p-6 sm:p-8">
          <h3 className={`text-lg font-bold ${heading}`}>
            Already initialized somewhere else?
          </h3>
          <p className={`mt-2 max-w-3xl text-sm leading-relaxed ${muted}`}>
            The SDK is safe to guard with{" "}
            <span className="text-brand-600 dark:text-brand-300 font-mono text-[0.85em]">
              isInitialized()
            </span>
            , can be fully torn down with{" "}
            <span className="text-brand-600 dark:text-brand-300 font-mono text-[0.85em]">
              destroy()
            </span>
            , and keeps{" "}
            <span className="text-brand-600 dark:text-brand-300 font-mono text-[0.85em]">
              globalThis.__sentry__ available
            </span>{" "}
            for live inspection while debugging.
          </p>
        </div>
      </ui-reveal>
    </Section>
  );
}
