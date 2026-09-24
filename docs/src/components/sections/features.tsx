import { Icon } from "@/components/icons/icon";
import { Section } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight";
import { FEATURES } from "@/lib/data";
import { t } from "@/lib/i18n";
import { card, cardHover, heading, iconTile, muted } from "@/lib/styles";

export function Features() {
  return (
    <Section
      id="features"
      eyebrow={t("features.eyebrow")}
      title={t("features.title")}
      accent={t("features.accent")}
      description={t("features.description")}
    >
      <ui-reveal-list className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <ui-reveal-item key={feature.id} className="h-full">
            <SpotlightCard
              className={`h-full rounded-2xl p-6 ${card} ${cardHover}`}
            >
              <span
                className={`${iconTile} grid size-11 place-items-center rounded-xl transition duration-300 group-hover:scale-105`}
              >
                <Icon
                  name={feature.icon}
                  className="size-5"
                  strokeWidth={2.2}
                />
              </span>
              <p className="text-brand-600 dark:text-brand-300/80 mt-4 text-[11px] font-bold tracking-[0.16em] uppercase">
                {t(`features.items.${feature.id}.tag`)}
              </p>
              <h3 className={`mt-1 text-lg font-bold ${heading}`}>
                {t(`features.items.${feature.id}.title`)}
              </h3>
              <p className={`mt-2 text-sm leading-relaxed ${muted}`}>
                {t(`features.items.${feature.id}.description`)}
              </p>
            </SpotlightCard>
          </ui-reveal-item>
        ))}
      </ui-reveal-list>
    </Section>
  );
}
