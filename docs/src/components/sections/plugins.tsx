import { Icon } from "@/components/icons/icon";
import { Section } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight";
import { t } from "@/lib/i18n";
import { CUSTOM_PLUGIN_CODE } from "./snippets";
import {
  band,
  card,
  cardHover,
  gradientText,
  heading,
  iconTile,
  iconTileSoft,
  line,
  muted,
} from "@/lib/styles";

interface PluginCard {
  readonly id: "plugin1" | "plugin2" | "plugin3";
  readonly icon: string;
  readonly name: string;
  readonly constructorLine: string;
  readonly bullets: readonly [
    "plugin1Bullet1" | "plugin2Bullet1" | "plugin3Bullet1",
    "plugin1Bullet2" | "plugin2Bullet2" | "plugin3Bullet2",
    "plugin1Bullet3" | "plugin2Bullet3" | "plugin3Bullet3",
    "plugin1Bullet4" | "plugin2Bullet4" | "plugin3Bullet4",
  ];
}

const PLUGINS: readonly PluginCard[] = [
  {
    id: "plugin1",
    icon: "gauge",
    name: "PerformancePlugin",
    constructorLine: "enablePlugin(new PerformancePlugin())",
    bullets: [
      "plugin1Bullet1",
      "plugin1Bullet2",
      "plugin1Bullet3",
      "plugin1Bullet4",
    ],
  },
  {
    id: "plugin2",
    icon: "camera",
    name: "ScreenRecordPlugin",
    constructorLine: "new ScreenRecordPlugin({ durationMs: 5000 })",
    bullets: [
      "plugin2Bullet1",
      "plugin2Bullet2",
      "plugin2Bullet3",
      "plugin2Bullet4",
    ],
  },
  {
    id: "plugin3",
    icon: "eye",
    name: "ExposurePlugin",
    constructorLine: "exposure.observe({ target, threshold, params })",
    bullets: [
      "plugin3Bullet1",
      "plugin3Bullet2",
      "plugin3Bullet3",
      "plugin3Bullet4",
    ],
  },
];

export function Plugins() {
  return (
    <Section
      id="plugins"
      eyebrow={t("plugins.eyebrow")}
      title={t("plugins.title")}
      accent={t("plugins.accent")}
      description={t("plugins.description")}
      className={band}
    >
      <ui-reveal-list className="grid gap-5 lg:grid-cols-3">
        {PLUGINS.map((plugin) => (
          <ui-reveal-item key={plugin.id} className="h-full">
            <SpotlightCard
              className={`h-full rounded-3xl p-6 ${card} ${cardHover}`}
            >
              <span
                className={`${iconTile} grid size-12 place-items-center rounded-2xl transition group-hover:scale-105`}
              >
                <Icon name={plugin.icon} className="size-6" />
              </span>
              <h3 className={`mt-4 font-mono text-base font-bold ${heading}`}>
                {plugin.name}
              </h3>
              <p className="text-brand-600 dark:text-brand-300 mt-1 text-sm font-medium">
                {t(`plugins.${plugin.id}Tagline`)}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {plugin.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className={`flex gap-2 text-sm leading-relaxed ${muted}`}
                  >
                    <span className="from-brand-600 to-brand-400 mt-1.5 size-1.5 shrink-0 rounded-full bg-linear-to-r" />
                    {t(`plugins.${bullet}`)}
                  </li>
                ))}
              </ul>
              <p
                className={`mt-5 rounded-xl border bg-slate-900/3 px-3 py-2 font-mono text-[11px] text-slate-600 dark:bg-white/5 dark:text-slate-300 ${line}`}
              >
                {plugin.constructorLine}
              </p>
            </SpotlightCard>
          </ui-reveal-item>
        ))}
      </ui-reveal-list>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <ui-reveal>
          <div>
            <span
              className={`${iconTileSoft} inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold`}
            >
              <Icon name="puzzle" className="size-3.5" />
              {t("plugins.byoBadge")}
            </span>
            <h3
              className={`mt-4 text-2xl font-black tracking-tight sm:text-3xl ${heading}`}
            >
              {t("plugins.extendTitle")}{" "}
              <span className={gradientText}>{t("plugins.extendAccent")}</span>
            </h3>
            <p className={`mt-4 text-base leading-relaxed ${muted}`}>
              {t("plugins.extendDescription")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-200 ${line}`}
              >
                <Icon
                  name="plug"
                  className="text-brand-500 dark:text-brand-300 size-4"
                />
                {t("plugins.chip1")}
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-200 ${line}`}
              >
                <Icon
                  name="camera"
                  className="text-brand-500 dark:text-brand-300 size-4"
                />
                {t("plugins.chip2")}
              </span>
            </div>
          </div>
        </ui-reveal>
        <ui-reveal delay={0.1}>
          <code-block
            code={CUSTOM_PLUGIN_CODE}
            filename="heartbeat.plugin.ts"
          />
        </ui-reveal>
      </div>
    </Section>
  );
}
