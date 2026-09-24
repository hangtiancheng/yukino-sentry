import { Icon } from "@/components/icons/icon";
import { Pill } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
import { t } from "@/lib/i18n";
import { RELIABILITY_CODE } from "./snippets";
import {
  card,
  faint,
  heading,
  iconTile,
  iconTileSoft,
  muted,
} from "@/lib/styles";

function pipeline(): readonly {
  label: string;
  caption: string;
  icon: string;
}[] {
  return [
    {
      label: t("reliability.pipe1Label"),
      caption: t("reliability.pipe1Caption"),
      icon: "bug",
    },
    {
      label: t("reliability.pipe2Label"),
      caption: t("reliability.pipe2Caption"),
      icon: "database",
    },
    {
      label: t("reliability.pipe3Label"),
      caption: t("reliability.pipe3Caption"),
      icon: "layers",
    },
    {
      label: t("reliability.pipe4Label"),
      caption: t("reliability.pipe4Caption"),
      icon: "send",
    },
    {
      label: t("reliability.pipe5Label"),
      caption: t("reliability.pipe5Caption"),
      icon: "refresh-cw",
    },
  ];
}

function guarantees() {
  return [
    {
      icon: "shield-check",
      title: t("reliability.guarantee1Title"),
      description: t("reliability.guarantee1Description"),
    },
    {
      icon: "filter",
      title: t("reliability.guarantee2Title"),
      description: t("reliability.guarantee2Description"),
    },
    {
      icon: "layers",
      title: t("reliability.guarantee3Title"),
      description: t("reliability.guarantee3Description"),
    },
  ];
}

export function Reliability() {
  const steps = pipeline();
  return (
    <Section
      id="reliability"
      eyebrow={t("reliability.eyebrow")}
      title={t("reliability.title")}
      accent={t("reliability.accent")}
      description={t("reliability.description")}
    >
      <ui-reveal>
        <div className={`${card} rounded-3xl p-6 sm:p-8`}>
          <div className="grid gap-6 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step.icon} className="relative">
                <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-3">
                  <span
                    className={`${iconTile} grid size-11 shrink-0 place-items-center rounded-xl`}
                  >
                    <Icon name={step.icon} className="size-5" />
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${heading}`}>
                      {step.label}
                    </p>
                    <p className={`mt-0.5 text-xs leading-relaxed ${faint}`}>
                      {step.caption}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 ? (
                  <enter-effect
                    viewport
                    initial={{ scaleX: 0 }}
                    duration={0.5}
                    delay={index * 0.12}
                    className="from-brand-400/70 to-g-yellow-400/70 absolute top-5 -right-3 hidden h-px w-6 origin-left bg-linear-to-r md:block"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </ui-reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <ui-reveal-list className="space-y-4">
          {guarantees().map((item) => (
            <ui-reveal-item key={item.title}>
              <article className={`${card} flex gap-4 rounded-2xl p-5`}>
                <span
                  className={`${iconTileSoft} grid size-10 shrink-0 place-items-center rounded-xl`}
                >
                  <Icon name={item.icon} className="size-5" />
                </span>
                <div>
                  <h3 className={`font-bold ${heading}`}>{item.title}</h3>
                  <p className={`mt-1 text-sm leading-relaxed ${muted}`}>
                    {item.description}
                  </p>
                </div>
              </article>
            </ui-reveal-item>
          ))}
        </ui-reveal-list>

        <ui-reveal delay={0.1}>
          <code-block code={RELIABILITY_CODE} filename="sentry.config.ts" />
        </ui-reveal>
      </div>

      <ui-reveal-item className="mt-8 flex flex-wrap gap-3">
        <Pill icon="send">{t("reliability.pill1")}</Pill>
        <Pill icon="layers">{t("reliability.pill2")}</Pill>
        <Pill icon="refresh-cw">{t("reliability.pill3")}</Pill>
        <Pill icon="database">{t("reliability.pill4")}</Pill>
      </ui-reveal-item>
    </Section>
  );
}
