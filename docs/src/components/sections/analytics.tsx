import { Icon } from "@/components/icons/icon";
import { MonoTag, Pill } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
import { t } from "@/lib/i18n";
import { CLICK_HTML, EXPOSURE_CODE, PV_CODE } from "./snippets";
import { card, faint, heading, iconTile, line, muted } from "@/lib/styles";

const DWELL_ROWS = [
  {
    label: "PageLoad",
    value: "2.4s",
    width: "22%",
    tone: "from-brand-600 to-brand-400",
  },
  {
    label: "HistoryChange",
    value: "8.1s",
    width: "64%",
    tone: "from-accent-500 to-accent-400",
  },
  {
    label: "PageDwell",
    value: "12.4s",
    width: "92%",
    tone: "from-brand-400 to-accent-400",
  },
] as const;

function AnalyticsCard({
  icon,
  label,
  title,
  children,
}: {
  readonly icon: string;
  readonly label: string;
  readonly title: string;
  readonly children: unknown;
}) {
  return (
    <ui-reveal-item className="h-full">
      <article className={`${card} flex h-full flex-col rounded-3xl p-6`}>
        <span
          className={`${iconTile} grid size-11 place-items-center rounded-xl`}
        >
          <Icon name={icon} className="size-5" />
        </span>
        <p className="text-brand-600 dark:text-brand-300/80 mt-4 text-[11px] font-bold tracking-[0.16em] uppercase">
          {label}
        </p>
        <h3 className={`mt-1 text-lg font-bold ${heading}`}>{title}</h3>
        <div className="mt-4 flex-1">{children}</div>
      </article>
    </ui-reveal-item>
  );
}

function DwellVisual() {
  return (
    <div className="space-y-3">
      {DWELL_ROWS.map((row) => (
        <div key={row.label}>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">
              {row.label}
            </span>
            <span className={`font-mono ${faint}`}>{row.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-900/5 dark:bg-white/5">
            <div
              className={`h-full rounded-full bg-linear-to-r ${row.tone}`}
              style={{ width: row.width }}
            />
          </div>
        </div>
      ))}
      <p className={`pt-1 text-xs ${faint}`}>{t("analytics.dwellNote")}</p>
    </div>
  );
}

function ExposureVisual() {
  return (
    <div className="space-y-3">
      <div className="border-brand-400/50 bg-brand-500/5 relative overflow-hidden rounded-xl border border-dashed p-4">
        <div className="via-accent-400/70 absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent" />
        <div className="flex items-center justify-between">
          <span className="dark:bg-ink-800 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm dark:text-white">
            <Icon
              name="eye"
              className="text-brand-500 dark:text-brand-300 size-3.5"
            />
            #banner
          </span>
          <span className="bg-accent-500/15 text-accent-600 dark:text-accent-300 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold">
            {t("analytics.exposureVisible")}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10">
          <div className="from-brand-600 to-accent-500 h-full w-3/4 rounded-full bg-linear-to-r" />
        </div>
      </div>
      <p className={`text-xs ${faint}`}>{t("analytics.exposureNote")}</p>
    </div>
  );
}

export function Analytics() {
  return (
    <Section
      id="analytics"
      eyebrow={t("analytics.eyebrow")}
      title={t("analytics.title")}
      accent={t("analytics.accent")}
      description={t("analytics.description")}
    >
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <ui-reveal>
          <div className={`${card} rounded-3xl p-6`}>
            <DwellVisual />
          </div>
        </ui-reveal>
        <ui-reveal delay={0.1}>
          <code-block code={PV_CODE} filename="analytics.ts" />
        </ui-reveal>
      </div>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <ui-reveal className="lg:order-2">
          <div className={`${card} rounded-3xl p-6`}>
            <p className={`mb-4 text-sm font-bold ${heading}`}>
              {t("analytics.clickAttrsTitle")}
            </p>
            <dl className="space-y-3 text-sm">
              {[
                ["yukino-sentry-ev", t("analytics.attr1Description")],
                ["yukino-sentry-msg", t("analytics.attr2Description")],
                ["yukino-sentry-view", t("analytics.attr3Description")],
                ["yukino-sentry-*", t("analytics.attr4Description")],
              ].map(([attr, description]) => (
                <div
                  key={attr}
                  className="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
                >
                  <dt className="w-44 shrink-0">
                    <MonoTag>{attr}</MonoTag>
                  </dt>
                  <dd className={muted}>{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </ui-reveal>
        <ui-reveal delay={0.1} className="lg:order-1">
          <code-block code={CLICK_HTML} filename="hero.html" />
        </ui-reveal>
      </div>

      <ui-reveal-list className="mt-14 grid gap-5 lg:grid-cols-3">
        <AnalyticsCard
          icon="route"
          label={t("analytics.card1Label")}
          title={t("analytics.card1Title")}
        >
          <p className={`text-sm leading-relaxed ${muted}`}>
            {t("analytics.card1Description")}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          icon="mouse-pointer-click"
          label={t("analytics.card2Label")}
          title={t("analytics.card2Title")}
        >
          <p className={`text-sm leading-relaxed ${muted}`}>
            {t("analytics.card2Description")}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          icon="eye"
          label={t("analytics.card3Label")}
          title={t("analytics.card3Title")}
        >
          <ExposureVisual />
        </AnalyticsCard>
      </ui-reveal-list>

      <ui-reveal delay={0.1} className="mt-10">
        <div className={`overflow-hidden rounded-3xl border ${line}`}>
          <code-block code={EXPOSURE_CODE} filename="exposure.ts" />
        </div>
      </ui-reveal>

      <ui-reveal-item className="mt-8 flex flex-wrap gap-3">
        <Pill icon="timer">{t("analytics.pill1")}</Pill>
        <Pill icon="mouse-pointer-click">{t("analytics.pill2")}</Pill>
        <Pill icon="eye">{t("analytics.pill3")}</Pill>
      </ui-reveal-item>
    </Section>
  );
}
