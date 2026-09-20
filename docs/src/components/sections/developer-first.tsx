import { Icon } from "@/components/icons/icon";
import { Pill } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
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
        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 ${border} dark:bg-ink-900/50 shadow-card bg-white p-5 transition duration-300 hover:-translate-y-1 sm:p-6 dark:shadow-none`}
      >
        <span
          className={`pointer-events-none absolute -top-24 -right-24 size-56 rounded-full ${glow} blur-3xl`}
        />
        <div className="bg-brand-50 border-brand-200/70 shadow-brand-950/10 dark:bg-ink-950 relative mb-6 rounded-2xl border p-4 shadow-xl dark:border-white/10 dark:shadow-black/30">
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
        <span className="text-emerald-600 dark:text-emerald-400">➜</span>
        <span className="text-brand-600 dark:text-brand-300">~</span>
        <span className="text-slate-700 dark:text-slate-200">
          npm install @yukino.js/sentry
        </span>
        <span className="bg-brand-500 dark:bg-brand-400 animate-blink inline-block h-4 w-2" />
      </div>
      <p className="mt-2 text-slate-500">added 1 package in 1.2s</p>
      <p className="text-slate-500">
        ready to monitor — no agent, no build step
      </p>
    </div>
  );
}

const CLASSIFICATION = [
  {
    label: "Code error",
    kind: "code",
    icon: "bug",
    tone: "text-accent-500 dark:text-accent-300",
  },
  {
    label: "Resource error",
    kind: "resource",
    icon: "globe",
    tone: "text-amber-500 dark:text-amber-300",
  },
  {
    label: "Runtime error",
    kind: "runtime",
    icon: "triangle-alert",
    tone: "text-brand-500 dark:text-brand-300",
  },
  {
    label: "Unknown reason",
    kind: "unknown",
    icon: "wifi",
    tone: "text-sky-500 dark:text-sky-300",
  },
] as const;

function ClassificationMock() {
  return (
    <ul className="space-y-2 font-mono text-xs">
      {CLASSIFICATION.map((item) => (
        <li
          key={item.label}
          className="bg-brand-100/50 flex items-center justify-between rounded-lg px-3 py-2 dark:bg-white/5"
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
        deduplicated · grouped after 2s · batched at 5
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
          className="size-3.5 shrink-0 text-lime-600 dark:text-lime-300"
        />
        Rolling rrweb window · gzip + base64
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
            className="from-brand-500/40 flex-1 origin-bottom rounded-sm bg-linear-to-t to-lime-400/80 dark:to-lime-300/80"
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

const QUEUE_STEPS: readonly {
  label: string;
  icon: string;
  tone: string;
}[] = [
  {
    label: "Capture",
    icon: "bug",
    tone: "text-accent-500 dark:text-accent-300",
  },
  {
    label: "Queue",
    icon: "database",
    tone: "text-brand-500 dark:text-brand-300",
  },
  { label: "Beacon", icon: "send", tone: "text-sky-500 dark:text-sky-300" },
  {
    label: "Recover",
    icon: "refresh-cw",
    tone: "text-lime-600 dark:text-lime-300",
  },
];

function OfflineMock() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {QUEUE_STEPS.map((step, index) => (
          <span key={step.label} className="flex items-center gap-2">
            <span className="bg-brand-100/60 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-200">
              <Icon name={step.icon} className={`size-3.5 ${step.tone}`} />
              {step.label}
            </span>
            {index < QUEUE_STEPS.length - 1 ? (
              <span className="text-brand-400 dark:text-slate-600">→</span>
            ) : null}
          </span>
        ))}
      </div>
      <div className="bg-brand-100/40 rounded-lg p-3 font-mono text-[11px] text-slate-500 dark:bg-white/5 dark:text-slate-400">
        {/* The storage key is one unbreakable token; without break-all its
            min-content width forces the whole card past the viewport. */}
        <p className="break-all">
          localStorage["yukino_sentry_offline_cache"]{" "}
          <span className="text-lime-600 dark:text-lime-300">· 42 events</span>
        </p>
        <p className="mt-1">
          retry probe{" "}
          <span className="text-brand-600 dark:text-brand-300">
            HEAD /api/log
          </span>{" "}
          · backoff 1s → 60s
        </p>
      </div>
    </div>
  );
}

export function DeveloperFirst() {
  return (
    <Section
      eyebrow="Developer first"
      title="Built for the people"
      accent="who ship."
      description="No agents to install, no dashboards to learn. A tiny client, honest defaults and escape hatches everywhere."
      className={band}
    >
      <ui-reveal-list className="grid gap-5 lg:grid-cols-2">
        <DevCard
          border="border-brand-400/50"
          glow="bg-brand-500/20"
          title="Monitor in five lines"
          description="Drop in the SDK and you are done. The core is tree-shakeable, framework agnostic and safe to import on any page."
        >
          <TerminalMock />
        </DevCard>

        <DevCard
          border="border-accent-400/50"
          glow="bg-accent-500/20"
          title="Classify every issue automatically"
          description="Code, resource, runtime and unknown errors each take a dedicated path, so routing, dedup and batching behave predictably."
        >
          <ClassificationMock />
        </DevCard>

        <DevCard
          border="border-lime-400/50"
          glow="bg-lime-400/20"
          title="See the session, not just the stack"
          description="Breadcrumbs and a compressed rrweb window replay the moments before a failure — clicks, routes, requests and the DOM."
        >
          <TimelineMock />
        </DevCard>

        <DevCard
          border="border-sky-400/50"
          glow="bg-sky-400/20"
          title="Stay in the flow, even offline"
          description="Events persist to localStorage, ship with sendBeacon and recover through an exponential health probe when the network returns."
        >
          <OfflineMock />
        </DevCard>
      </ui-reveal-list>

      <ui-reveal-item className="mt-8 flex flex-wrap items-center gap-3">
        <Pill icon="bug">Dedup by error identity</Pill>
        <Pill icon="database">Bounded FIFO breadcrumbs</Pill>
        <Pill icon="refresh-cw">Zero-loss offline queue</Pill>
        <Pill icon="camera">Screen record on demand</Pill>
      </ui-reveal-item>
    </Section>
  );
}
