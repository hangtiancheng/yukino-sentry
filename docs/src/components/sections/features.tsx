import { Icon } from "@/components/icons/icon";
import { Section } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight";
import { FEATURES } from "@/lib/data";
import { card, cardHover, heading, iconTile, muted } from "@/lib/styles";

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Platform"
      title="One SDK,"
      accent="every signal."
      description="Everything the browser can tell you about a session — errors, network, performance, behaviour and reliability — captured by a single, fully typed client that never blocks your app."
    >
      <ui-reveal-list className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <ui-reveal-item key={feature.title} className="h-full">
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
              <p className="text-brand-500/80 dark:text-brand-300/80 mt-4 text-[11px] font-bold tracking-[0.16em] uppercase">
                {feature.tag}
              </p>
              <h3 className={`mt-1 text-lg font-bold ${heading}`}>
                {feature.title}
              </h3>
              <p className={`mt-2 text-sm leading-relaxed ${muted}`}>
                {feature.description}
              </p>
            </SpotlightCard>
          </ui-reveal-item>
        ))}
      </ui-reveal-list>
    </Section>
  );
}
