import { cn } from "@/lib/cn";
import { WORKFLOW_STEPS } from "@/lib/data";
import { t } from "@/lib/i18n";
import { Icon } from "@/components/icons/icon";
import { container, heading, muted } from "@/lib/styles";
import { Section, SectionHeader } from "@/components/ui/section";

export function Workflow() {
  return (
    <Section id="workflow" className="bg-[#f8f9fa] dark:bg-white/2">
      <SectionHeader
        eyebrow={t("workflow.eyebrow")}
        titleA={t("workflow.titleA")}
        titleHighlight={t("workflow.titleHighlight")}
        description={t("workflow.description")}
      />

      <div className={cn(container, "mt-16")}>
        <div className="relative grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-8">
          <div
            className="via-brand-500/40 pointer-events-none absolute inset-x-0 top-6 hidden h-px bg-linear-to-r from-transparent to-transparent sm:block"
            aria-hidden="true"
          />
          {WORKFLOW_STEPS.map((step, index) => (
            <ui-reveal key={step.id} delay={index * 0.08} className="relative">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "shadow-soft border-brand-950/8 relative grid size-12 place-items-center rounded-2xl border bg-white dark:border-white/8 dark:bg-[#1e1f20] dark:shadow-none",
                    )}
                  >
                    <Icon
                      name={step.icon}
                      className="text-brand-500 dark:text-brand-400 size-5"
                    />
                    <span className="bg-brand-600 dark:bg-brand-300 dark:text-brand-950 absolute -top-2 -right-2 grid size-6 place-items-center rounded-full font-mono text-[10px] font-semibold text-white">
                      {step.step}
                    </span>
                  </span>
                </div>
                <h3
                  className={cn(
                    "mt-5 text-base font-semibold tracking-[-0.02em]",
                    heading,
                  )}
                >
                  {t(`workflow.steps.${step.id}.title`)}
                </h3>
                <p className={cn("mt-2 text-sm leading-relaxed", muted)}>
                  {t(`workflow.steps.${step.id}.description`)}
                </p>
                {step.command ? (
                  <code
                    className={cn(
                      "border-brand-950/8 bg-brand-50/60 mt-3 inline-flex max-w-full items-center gap-1.5 overflow-x-auto rounded-lg border px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap text-[#3c4043] dark:border-white/8 dark:bg-white/3 dark:text-[#e8eaed]",
                    )}
                  >
                    <span className="text-brand-500 dark:text-brand-400">
                      $
                    </span>
                    {step.command}
                  </code>
                ) : null}
              </div>
            </ui-reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
