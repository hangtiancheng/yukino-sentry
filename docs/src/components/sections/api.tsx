import { Icon } from "@/components/icons/icon";
import { Section } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight";
import { API_ITEMS } from "@/lib/data";
import { t } from "@/lib/i18n";
import { card, cardHover, heading, iconTile, muted } from "@/lib/styles";

export function Api() {
  return (
    <Section
      id="api"
      eyebrow={t("api.eyebrow")}
      title={t("api.title")}
      accent={t("api.accent")}
      description={t("api.description")}
    >
      <ui-reveal-list
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.05}
      >
        {API_ITEMS.map((item) => (
          <ui-reveal-item key={item.id} className="h-full">
            <SpotlightCard
              className={`h-full rounded-2xl p-5 ${card} ${cardHover}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`${iconTile} grid size-10 place-items-center rounded-xl`}
                >
                  <Icon name={item.icon} className="size-4.5" />
                </span>
                <h3 className={`font-mono text-sm font-bold ${heading}`}>
                  {item.name}
                </h3>
              </div>
              <code className="text-brand-700 dark:text-brand-200 mt-4 block overflow-x-auto rounded-lg bg-slate-900/4 px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre dark:bg-white/5">
                {item.signature}
              </code>
              <p className={`mt-3 text-sm leading-relaxed ${muted}`}>
                {t(`api.items.${item.id}`)}
              </p>
            </SpotlightCard>
          </ui-reveal-item>
        ))}
      </ui-reveal-list>
    </Section>
  );
}
