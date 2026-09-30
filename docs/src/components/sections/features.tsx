import { cn } from "@/lib/cn";
import { FEATURES } from "@/lib/data";
import type { Feature } from "@/lib/data";
import { REPO_URL } from "@/lib/data";
import { t } from "@/lib/i18n";
import { Icon } from "@/components/icons/icon";
import { SpotlightCard } from "@/components/ui/spotlight";
import { chip, container, heading, line, muted } from "@/lib/styles";
import { Section, SectionHeader } from "@/components/ui/section";

const ACCENT_TILE: Record<Feature["accent"], string> = {
  brand:
    "bg-brand-500/12 text-brand-600 dark:bg-brand-400/12 dark:text-brand-300",
  green:
    "bg-g-green-500/12 text-g-green-600 dark:bg-g-green-400/12 dark:text-g-green-300",
  yellow:
    "bg-g-yellow-400/15 text-g-yellow-600 dark:bg-g-yellow-400/10 dark:text-g-yellow-300",
  neutral:
    "bg-[#f1f3f4] text-[#3c4043] dark:bg-white/[0.06] dark:text-[#e8eaed]",
};

export function Features() {
  return (
    <Section id="features">
      <SectionHeader
        eyebrow={t("features.eyebrow")}
        titleA={t("features.titleA")}
        titleHighlight={t("features.titleHighlight")}
        description={t("features.description")}
      />

      <div
        className={cn(
          container,
          "mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {FEATURES.map((feature, index) => (
          <ui-reveal
            key={feature.id}
            delay={(index % 3) * 0.06}
            className={cn(feature.wide && "lg:col-span-2")}
          >
            <SpotlightCard className="shadow-card h-full rounded-2xl border border-[#dadce0] bg-white p-6 sm:p-7 dark:border-white/10 dark:bg-[#1e1f20] dark:shadow-none">
              <div className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-xl",
                    ACCENT_TILE[feature.accent],
                  )}
                >
                  <Icon name={feature.icon} className="size-5" />
                </span>
                <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Icon
                    name="sparkles"
                    className="text-brand-400/60 size-4 dark:text-zinc-600"
                  />
                </span>
              </div>
              <h3
                className={cn(
                  "mt-5 text-lg font-semibold tracking-[-0.02em]",
                  heading,
                )}
              >
                {t(`features.items.${feature.id}.title`)}
              </h3>
              <p className={cn("mt-2.5 text-sm leading-relaxed", muted)}>
                {t(`features.items.${feature.id}.description`)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {feature.chips.map((chipLabel) => (
                  <span key={chipLabel} className={chip}>
                    <span className="bg-brand-500 size-1.5 rounded-full" />
                    {chipLabel}
                  </span>
                ))}
              </div>
            </SpotlightCard>
          </ui-reveal>
        ))}
      </div>

      <ui-reveal delay={0.1} className={cn(container, "mt-4")}>
        <div
          className={cn(
            "bg-brand-50/60 flex flex-col items-start justify-between gap-4 rounded-2xl border px-6 py-5 sm:flex-row sm:items-center dark:bg-white/2",
            line,
          )}
        >
          <div className="flex items-center gap-3">
            <span className="bg-brand-700 dark:bg-brand-300 dark:text-brand-950 grid size-9 place-items-center rounded-lg text-white">
              <Icon name="wand-sparkles" className="size-4" />
            </span>
            <p className={cn("text-sm", muted)}>{t("features.footnote")}</p>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:text-brand-500 dark:text-brand-300 dark:hover:text-brand-200 text-sm font-semibold transition-colors"
          >
            {t("features.exploreHooks")} →
          </a>
        </div>
      </ui-reveal>
    </Section>
  );
}
