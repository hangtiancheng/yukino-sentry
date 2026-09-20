import { Icon } from "@/components/icons/icon";
import { MonoTag } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight";
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
  readonly icon: string;
  readonly name: string;
  readonly tagline: string;
  readonly constructorLine: string;
  readonly bullets: readonly string[];
}

const PLUGINS: readonly PluginCard[] = [
  {
    icon: "gauge",
    name: "PerformancePlugin",
    tagline: "Field performance, out of the box.",
    constructorLine: "enablePlugin(new PerformancePlugin())",
    bullets: [
      "LCP, FCP, CLS, INP and TTFB from web-vitals",
      "Custom First Screen Paint from DOM mutations",
      "Navigation, resource, long-task and memory data",
      "Zero constructor options, safe capability checks",
    ],
  },
  {
    icon: "camera",
    name: "ScreenRecordPlugin",
    tagline: "Replay the seconds that matter.",
    constructorLine: "new ScreenRecordPlugin({ durationMs: 5000 })",
    bullets: [
      "Rolling rrweb window, gzip + base64 encoded",
      "Configurable trigger event types",
      "Canvas recording and inline images enabled",
      "Decode with unzipScreenRecord() anywhere",
    ],
  },
  {
    icon: "eye",
    name: "ExposurePlugin",
    tagline: "Measure what people actually see.",
    constructorLine: "exposure.observe({ target, threshold, params })",
    bullets: [
      "IntersectionObserver with per-threshold reuse",
      "Visible duration, show times and custom params",
      "Batch observe and unobserve helpers",
      "Zod-validated targets and thresholds",
    ],
  },
];

export function Plugins() {
  return (
    <Section
      id="plugins"
      eyebrow="Plugins"
      title="Optional power,"
      accent="opt-in bundle cost."
      description="Capabilities like performance, screen recording and exposure tracking live in @yukino.js/sentry/plugins. Import only what you enable — the core entry stays lean."
      className={band}
    >
      <ui-reveal-list className="grid gap-5 lg:grid-cols-3">
        {PLUGINS.map((plugin) => (
          <ui-reveal-item key={plugin.name} className="h-full">
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
                {plugin.tagline}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {plugin.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className={`flex gap-2 text-sm leading-relaxed ${muted}`}
                  >
                    <span className="from-brand-500 to-accent-500 mt-1.5 size-1.5 shrink-0 rounded-full bg-linear-to-r" />
                    {bullet}
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
              Bring your own
            </span>
            <h3
              className={`mt-4 text-2xl font-black tracking-tight sm:text-3xl ${heading}`}
            >
              Extend the SDK with a{" "}
              <span className={gradientText}>single class.</span>
            </h3>
            <p className={`mt-4 text-base leading-relaxed ${muted}`}>
              Implement <MonoTag>SentryPlugin</MonoTag> and get lifecycle-aware{" "}
              <MonoTag>init()</MonoTag> and optional{" "}
              <MonoTag>destroy()</MonoTag> hooks. Plugins are registered once,
              stored in a set and cleaned up with <MonoTag>destroy()</MonoTag>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-200 ${line}`}
              >
                <Icon
                  name="plug"
                  className="text-brand-500 dark:text-brand-300 size-4"
                />
                Abstract base class
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:bg-white/5 dark:text-slate-200 ${line}`}
              >
                <Icon
                  name="camera"
                  className="text-brand-500 dark:text-brand-300 size-4"
                />
                Shared reporter instance
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
