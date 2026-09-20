import { Icon } from "@/components/icons/icon";
import { Pill } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
import { PERFORMANCE_CODE } from "./snippets";
import {
  band,
  card,
  faint,
  heading,
  iconTile,
  iconTileSoft,
  muted,
} from "@/lib/styles";

const VITALS = [
  {
    name: "LCP",
    label: "Largest Contentful Paint",
    value: "1.24s",
    width: "38%",
  },
  {
    name: "FCP",
    label: "First Contentful Paint",
    value: "0.90s",
    width: "28%",
  },
  {
    name: "CLS",
    label: "Cumulative Layout Shift",
    value: "0.02",
    width: "12%",
  },
  {
    name: "INP",
    label: "Interaction to Next Paint",
    value: "86ms",
    width: "22%",
  },
  {
    name: "TTFB",
    label: "Time to First Byte",
    value: "0.31s",
    width: "16%",
  },
  {
    name: "FSP",
    label: "First Screen Paint",
    value: "1.10s",
    width: "34%",
  },
] as const;

interface MetricSource {
  readonly icon: string;
  readonly name: string;
  readonly source: string;
  readonly description: string;
}

const METRIC_SOURCES: readonly MetricSource[] = [
  {
    icon: "activity",
    name: "NavigationTiming",
    source: "Navigation Timing API",
    description:
      "paint, DOM, load, DNS, TCP, TLS, TTFB, transfer and redirect breakdown.",
  },
  {
    icon: "layers",
    name: "ResourceList",
    source: "performance.getEntriesByType",
    description:
      "Snapshot of every buffered resource with cache and transfer sizes.",
  },
  {
    icon: "route",
    name: "ResourceTiming",
    source: "PerformanceObserver",
    description:
      "Per-resource durations as they complete, with element fallback.",
  },
  {
    icon: "zap",
    name: "LongTask",
    source: "PerformanceObserver",
    description:
      "Main-thread tasks that block interaction, reported as entries.",
  },
  {
    icon: "memory-stick",
    name: "Memory",
    source: "measureUserAgentSpecificMemory",
    description: "Chrome-only memory attribution when the API is available.",
  },
];

export function Performance() {
  return (
    <Section
      id="performance"
      eyebrow="Performance"
      title="Real user metrics,"
      accent="measured in the field."
      description="Web Vitals and a full navigation timing breakdown run beside your errors, so a slow request and a crash are one story."
      className={band}
    >
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <ui-reveal>
          <div className={`${card} h-full rounded-3xl p-6`}>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`${iconTile} grid size-9 place-items-center rounded-xl`}
                >
                  <Icon name="gauge" className="size-4" />
                </span>
                <p className={`text-sm font-bold ${heading}`}>Web Vitals</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                all good
              </span>
            </div>
            <div className="space-y-5">
              {VITALS.map((vital, index) => (
                <div key={vital.name}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <span className="text-brand-600 dark:text-brand-300 shrink-0 font-mono text-xs font-bold">
                        {vital.name}
                      </span>
                      <span className={`truncate text-xs font-normal ${faint}`}>
                        {vital.label}
                      </span>
                    </span>
                    <span className={`font-mono text-sm font-bold ${heading}`}>
                      {vital.value}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-900/5 dark:bg-white/5">
                    <enter-effect
                      viewport
                      initial={{ width: "0%" }}
                      to={{ width: vital.width }}
                      duration={0.9}
                      delay={index * 0.07}
                      className="from-brand-500 to-accent-500 h-full rounded-full bg-linear-to-r"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ui-reveal>

        <ui-reveal delay={0.1} className="h-full">
          <code-block
            code={PERFORMANCE_CODE}
            filename="performance.ts"
            className="h-full"
          />
        </ui-reveal>
      </div>

      <ui-reveal-list className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRIC_SOURCES.map((source) => (
          <ui-reveal-item key={source.name} className="h-full">
            <article className={`${card} flex h-full flex-col rounded-2xl p-5`}>
              <div className="flex items-center gap-2.5">
                <span
                  className={`${iconTileSoft} grid size-9 place-items-center rounded-lg`}
                >
                  <Icon name={source.icon} className="size-4" />
                </span>
                <h3 className={`font-mono text-sm font-bold ${heading}`}>
                  {source.name}
                </h3>
              </div>
              <p className="text-brand-500/80 dark:text-brand-300/80 mt-3 text-[11px] font-bold tracking-wide uppercase">
                {source.source}
              </p>
              <p className={`mt-1.5 text-sm leading-relaxed ${muted}`}>
                {source.description}
              </p>
            </article>
          </ui-reveal-item>
        ))}
        <ui-reveal-item className="h-full">
          <article className="border-brand-400/40 from-brand-500/10 to-accent-500/10 flex h-full flex-col justify-center rounded-2xl border bg-linear-to-br p-5">
            <Icon
              name="timer"
              className="text-brand-600 dark:text-brand-300 size-5"
            />
            <h3 className={`mt-3 text-base font-bold ${heading}`}>
              Report your own
            </h3>
            <p className={`mt-1.5 text-sm leading-relaxed ${muted}`}>
              Any timing you own can be sent as a performance event with{" "}
              <span className="font-mono text-[0.85em]">tracePerformance</span>.
            </p>
          </article>
        </ui-reveal-item>
      </ui-reveal-list>

      <ui-reveal-item className="mt-8 flex flex-wrap gap-3">
        <Pill icon="gauge">Web Vitals via web-vitals</Pill>
        <Pill icon="activity">Field navigation timing</Pill>
        <Pill icon="zap">Long task visibility</Pill>
        <Pill icon="memory-stick">Memory attribution</Pill>
      </ui-reveal-item>
    </Section>
  );
}
