import { Icon } from "@/components/icons/icon";
import { Section } from "@/components/ui/section";
import { t } from "@/lib/i18n";
import { STEP1_CODE, STEP2_CODE, STEP3_CODE } from "./snippets";
import { card, faint, heading, muted } from "@/lib/styles";

interface Step {
  readonly icon: string;
  readonly titleKey:
    | "quickstart.step1Title"
    | "quickstart.step2Title"
    | "quickstart.step3Title"
    | "quickstart.step4Title";
  readonly descriptionKey:
    | "quickstart.step1Description"
    | "quickstart.step2Description"
    | "quickstart.step3Description"
    | "quickstart.step4Description";
  readonly code: string;
  readonly filename: string;
}

const STEPS: readonly Step[] = [
  {
    icon: "package",
    titleKey: "quickstart.step1Title",
    descriptionKey: "quickstart.step1Description",
    filename: "terminal",
    code: "npm install @yukino.js/sentry",
  },
  {
    icon: "radio",
    titleKey: "quickstart.step2Title",
    descriptionKey: "quickstart.step2Description",
    filename: "src/main.ts",
    code: STEP1_CODE,
  },
  {
    icon: "plug",
    titleKey: "quickstart.step3Title",
    descriptionKey: "quickstart.step3Description",
    filename: "src/plugins.ts",
    code: STEP2_CODE,
  },
  {
    icon: "wand-sparkles",
    titleKey: "quickstart.step4Title",
    descriptionKey: "quickstart.step4Description",
    filename: "src/checkout.ts",
    code: STEP3_CODE,
  },
];

export function QuickStart() {
  return (
    <Section
      id="quickstart"
      eyebrow={t("quickstart.eyebrow")}
      title={t("quickstart.title")}
      accent={t("quickstart.accent")}
      description={t("quickstart.description")}
    >
      <ui-reveal-list className="grid gap-6 lg:grid-cols-2">
        {STEPS.map((step, index) => (
          <ui-reveal-item key={step.titleKey} className="h-full">
            <div className={`${card} flex h-full flex-col rounded-3xl p-6`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="bg-brand-600 shadow-brand-600/25 relative grid size-11 shrink-0 place-items-center rounded-2xl text-lg font-black text-white shadow-lg">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3
                    className={`flex items-center gap-2 font-bold ${heading}`}
                  >
                    <Icon
                      name={step.icon}
                      className="text-brand-600 dark:text-brand-300 size-4 shrink-0"
                    />
                    {t(step.titleKey)}
                  </h3>
                  <p className={`mt-0.5 text-sm ${faint}`}>
                    {t(step.descriptionKey)}
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
        <div className="border-brand-400/40 from-brand-500/10 to-g-yellow-400/10 rounded-3xl border bg-linear-to-r via-transparent p-6 sm:p-8">
          <h3 className={`text-lg font-bold ${heading}`}>
            {t("quickstart.guardTitle")}
          </h3>
          <p className={`mt-2 max-w-3xl text-sm leading-relaxed ${muted}`}>
            {t("quickstart.guardDescription")}
          </p>
        </div>
      </ui-reveal>
    </Section>
  );
}
