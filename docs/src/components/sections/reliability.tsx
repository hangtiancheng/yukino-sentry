import { Icon } from "@/components/icons/icon";
import { Pill } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
import { RELIABILITY_CODE } from "./snippets";
import {
  card,
  faint,
  heading,
  iconTile,
  iconTileSoft,
  muted,
} from "@/lib/styles";

const PIPELINE: readonly {
  label: string;
  caption: string;
  icon: string;
}[] = [
  { label: "Capture", caption: "Handlers normalize every signal", icon: "bug" },
  {
    label: "Queue",
    caption: "In-memory batch with FIFO limits",
    icon: "database",
  },
  {
    label: "Persist",
    caption: "localStorage mirror while offline",
    icon: "layers",
  },
  { label: "Transport", caption: "sendBeacon ≤60KB, else fetch", icon: "send" },
  { label: "Recover", caption: "HEAD probe with backoff", icon: "refresh-cw" },
];

const GUARANTEES = [
  {
    icon: "shield-check",
    title: "Bounded memory",
    description:
      "Breadcrumbs and the error-dedup set are LRU-capped, so long-lived SPAs never grow without limit.",
  },
  {
    icon: "filter",
    title: "Precision filtering",
    description:
      "ignoreErrors matches message substrings or patterns; excludeAPIs uses exact URLs or regex.",
  },
  {
    icon: "layers",
    title: "Atomic batches",
    description:
      "A failed batch is pushed back to the queue head and persisted, so ordering is preserved end-to-end.",
  },
] as const;

export function Reliability() {
  return (
    <Section
      id="reliability"
      eyebrow="Reliability"
      title="Reporting that survives"
      accent="bad networks."
      description="A production monitoring client cannot afford to lose data or block the page. Yukino Sentry keeps a durable queue, ships asynchronously and never lets one failed batch stall the rest."
    >
      <ui-reveal>
        <div className={`${card} rounded-3xl p-6 sm:p-8`}>
          <div className="grid gap-6 md:grid-cols-5">
            {PIPELINE.map((step, index) => (
              <div key={step.label} className="relative">
                <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-3">
                  <span
                    className={`${iconTile} grid size-11 shrink-0 place-items-center rounded-xl`}
                  >
                    <Icon name={step.icon} className="size-5" />
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${heading}`}>
                      {step.label}
                    </p>
                    <p className={`mt-0.5 text-xs leading-relaxed ${faint}`}>
                      {step.caption}
                    </p>
                  </div>
                </div>
                {index < PIPELINE.length - 1 ? (
                  <enter-effect
                    viewport
                    initial={{ scaleX: 0 }}
                    duration={0.5}
                    delay={index * 0.12}
                    className="from-brand-400/70 to-accent-400/70 absolute top-5 -right-3 hidden h-px w-6 origin-left bg-linear-to-r md:block"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </ui-reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <ui-reveal-list className="space-y-4">
          {GUARANTEES.map((item) => (
            <ui-reveal-item key={item.title}>
              <article className={`${card} flex gap-4 rounded-2xl p-5`}>
                <span
                  className={`${iconTileSoft} grid size-10 shrink-0 place-items-center rounded-xl`}
                >
                  <Icon name={item.icon} className="size-5" />
                </span>
                <div>
                  <h3 className={`font-bold ${heading}`}>{item.title}</h3>
                  <p className={`mt-1 text-sm leading-relaxed ${muted}`}>
                    {item.description}
                  </p>
                </div>
              </article>
            </ui-reveal-item>
          ))}
        </ui-reveal-list>

        <ui-reveal delay={0.1}>
          <code-block code={RELIABILITY_CODE} filename="sentry.config.ts" />
        </ui-reveal>
      </div>

      <ui-reveal-item className="mt-8 flex flex-wrap gap-3">
        <Pill icon="send">sendBeacon first</Pill>
        <Pill icon="layers">keepalive-aware fetch</Pill>
        <Pill icon="refresh-cw">exponential recovery</Pill>
        <Pill icon="database">localStorage mirror</Pill>
      </ui-reveal-item>
    </Section>
  );
}
