import { Icon } from "@/components/icons/icon";
import { Pill } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
import { t } from "@/lib/i18n";
import { band, faint, heading, muted } from "@/lib/styles";

function DevCard({
  border,
  glow,
  title,
  description,
  children,
}: {
  readonly border: string;
  readonly glow: string;
  readonly title: string;
  readonly description: unknown;
  readonly children: unknown;
}) {
  return (
    <ui-reveal-item className="h-full">
      <div
        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 ${border} dark:bg-ink-900/50 shadow-card hover:shadow-raised bg-white p-5 transition duration-300 hover:-translate-y-1 sm:p-6 dark:shadow-none`}
      >
        <span
          className={`pointer-events-none absolute -top-24 -right-24 size-56 rounded-full ${glow} blur-3xl`}
        />
        <div className="bg-brand-50/60 dark:bg-ink-950 relative mb-6 rounded-2xl border border-[#dadce0] p-4 dark:border-white/10">
          {children}
        </div>
        <h3 className={`relative text-xl font-bold ${heading}`}>{title}</h3>
        <p className={`relative mt-2 text-sm leading-relaxed ${muted}`}>
          {description}
        </p>
      </div>
    </ui-reveal-item>
  );
}

function TerminalMock() {
  return (
    <div className="font-mono text-[13px] leading-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-g-green-600 dark:text-g-green-300">➜</span>
        <span className="text-brand-600 dark:text-brand-300">~</span>
        <span className="text-slate-700 dark:text-slate-200">
          npm install @yukino.js/sentry
        </span>
        <span className="bg-brand-500 dark:bg-brand-400 animate-blink inline-block h-4 w-2" />
      </div>
      <p className="mt-2 text-slate-500">{t("developer.terminalOutput1")}</p>
      <p className="text-slate-500">{t("developer.terminalOutput2")}</p>
    </div>
  );
}

function classification() {
  return [
    {
      label: t("developer.classify1"),
      kind: "code",
      icon: "bug",
      tone: "text-accent-500 dark:text-accent-300",
    },
    {
      label: t("developer.classify2"),
      kind: "resource",
      icon: "globe",
      tone: "text-g-yellow-500 dark:text-g-yellow-300",
    },
    {
      label: t("developer.classify3"),
      kind: "runtime",
      icon: "triangle-alert",
      tone: "text-brand-500 dark:text-brand-300",
    },
    {
      label: t("developer.classify4"),
      kind: "unknown",
      icon: "wifi",
      tone: "text-sky-500 dark:text-sky-300",
    },
  ] as const;
}

function ClassificationMock() {
  return (
    <ul className="space-y-2 font-mono text-xs">
      {classification().map((item) => (
        <li
          key={item.kind}
          className="bg-brand-100/40 flex items-center justify-between rounded-lg px-3 py-2 dark:bg-white/5"
        >
          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Icon
              name={item.icon}
              className={`size-3.5 shrink-0 ${item.tone}`}
            />
            {item.label}
          </span>
          <span className="bg-brand-200/50 rounded-md px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {item.kind}
          </span>
        </li>
      ))}
      <li className="pt-1 text-[11px] text-slate-500">
        {t("developer.classifyNote")}
      </li>
    </ul>
  );
}

const WAVEFORM = [
  10, 18, 26, 16, 30, 22, 34, 20, 28, 14, 24, 32, 18, 26, 12, 22, 30, 16, 24,
  20,
];

function TimelineMock() {
  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 text-xs font-semibold ${faint}`}>
        <Icon
          name="camera"
          className="text-g-yellow-600 dark:text-g-yellow-300 size-3.5 shrink-0"
        />
        {t("developer.timelineTitle")}
      </div>
      <div className="flex h-14 items-end gap-1">
        {WAVEFORM.map((height, index) => (
          <enter-effect
            key={index}
            viewport
            initial={{ scaleY: 0.1 }}
            duration={0.5}
            delay={index * 0.02}
            style={{ height: `${height * 1.6}px` }}
            className="from-brand-500/40 to-g-yellow-400/80 dark:to-g-yellow-300/80 flex-1 origin-bottom rounded-sm bg-linear-to-t"
          />
        ))}
      </div>
      <ul className="space-y-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
        <li className="flex items-center gap-2">
          <Icon
            name="route"
            className="text-brand-500 dark:text-brand-300 size-3 shrink-0"
          />{" "}
          HistoryChange → /checkout
        </li>
        <li className="flex items-center gap-2">
          <Icon
            name="braces"
            className="size-3 shrink-0 text-sky-500 dark:text-sky-300"
          />{" "}
          POST /api/order · 500
        </li>
        <li className="flex items-center gap-2">
          <Icon
            name="bug"
            className="text-accent-500 dark:text-accent-300 size-3 shrink-0"
          />{" "}
          TypeError: total is undefined
        </li>
      </ul>
    </div>
  );
}

function queueSteps(): readonly {
  label: string;
  icon: string;
  tone: string;
}[] {
  return [
    {
      label: t("developer.stepCapture"),
      icon: "bug",
      tone: "text-accent-500 dark:text-accent-300",
    },
    {
      label: t("developer.stepQueue"),
      icon: "database",
      tone: "text-brand-500 dark:text-brand-300",
    },
    {
      label: t("developer.stepBeacon"),
      icon: "send",
      tone: "text-sky-500 dark:text-sky-300",
    },
    {
      label: t("developer.stepRecover"),
      icon: "refresh-cw",
      tone: "text-g-green-600 dark:text-g-green-300",
    },
  ];
}

function OfflineMock() {
  const steps = queueSteps();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => (
          <span key={step.icon} className="flex items-center gap-2">
            <span className="bg-brand-100/50 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-200">
              <Icon name={step.icon} className={`size-3.5 ${step.tone}`} />
              {step.label}
            </span>
            {index < steps.length - 1 ? (
              <span className="text-brand-400 dark:text-slate-600">→</span>
            ) : null}
          </span>
        ))}
      </div>
      <div className="bg-brand-100/30 rounded-lg p-3 font-mono text-[11px] text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <p className="break-all">
          localStorage[&quot;yukino_sentry_offline_cache&quot;]{" "}
          <span className="text-g-green-600 dark:text-g-green-300">
            · {t("developer.offlineEvents")}
          </span>
        </p>
        <p className="mt-1">
          {t("developer.offlineProbe")}{" "}
          <span className="text-brand-600 dark:text-brand-300">
            HEAD /api/log
          </span>{" "}
          · {t("developer.offlineBackoff")}
        </p>
      </div>
    </div>
  );
}

export function DeveloperFirst() {
  return (
    <Section
      eyebrow={t("developer.eyebrow")}
      title={t("developer.title")}
      accent={t("developer.accent")}
      description={t("developer.description")}
      className={band}
    >
      <ui-reveal-list className="grid gap-5 lg:grid-cols-2">
        <DevCard
          border="border-brand-400/50"
          glow="bg-brand-500/20"
          title={t("developer.card1Title")}
          description={t("developer.card1Description")}
        >
          <TerminalMock />
        </DevCard>

        <DevCard
          border="border-accent-400/50"
          glow="bg-accent-500/20"
          title={t("developer.card2Title")}
          description={t("developer.card2Description")}
        >
          <ClassificationMock />
        </DevCard>

        <DevCard
          border="border-g-yellow-400/50"
          glow="bg-g-yellow-400/20"
          title={t("developer.card3Title")}
          description={t("developer.card3Description")}
        >
          <TimelineMock />
        </DevCard>

        <DevCard
          border="border-sky-400/50"
          glow="bg-sky-400/20"
          title={t("developer.card4Title")}
          description={t("developer.card4Description")}
        >
          <OfflineMock />
        </DevCard>
      </ui-reveal-list>

      <ui-reveal-item className="mt-8 flex flex-wrap items-center gap-3">
        <Pill icon="bug">{t("developer.pill1")}</Pill>
        <Pill icon="database">{t("developer.pill2")}</Pill>
        <Pill icon="refresh-cw">{t("developer.pill3")}</Pill>
        <Pill icon="camera">{t("developer.pill4")}</Pill>
      </ui-reveal-item>
    </Section>
  );
}
