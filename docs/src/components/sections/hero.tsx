import { GithubIcon } from "@/components/icons/github-icon";
import { Icon } from "@/components/icons/icon";
import { t } from "@/lib/i18n";
import { handleAnchorClick } from "@/lib/scroll";
import {
  container,
  faint,
  gradientText,
  gridPattern,
  heading,
  line,
  muted,
  primaryButton,
  secondaryButton,
} from "@/lib/styles";
import { HERO_CODE } from "./snippets";

interface FloatingCard {
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly className: string;
  readonly delay: number;
  readonly accent: string;
}

function floatingCards(): readonly FloatingCard[] {
  return [
    {
      icon: "bug",
      title: t("hero.float1Title"),
      subtitle: t("hero.float1Sub"),
      className: "-top-6 -left-4 sm:-left-10",
      delay: 0.5,
      accent: "text-accent-500 dark:text-accent-400",
    },
    {
      icon: "gauge",
      title: t("hero.float2Title"),
      subtitle: t("hero.float2Sub"),
      className: "-right-3 top-24 sm:-right-8",
      delay: 0.7,
      accent: "text-g-green-500 dark:text-g-green-300",
    },
    {
      icon: "timer",
      title: t("hero.float3Title"),
      subtitle: t("hero.float3Sub"),
      className: "-bottom-6 left-6 sm:left-10",
      delay: 0.9,
      accent: "text-brand-500 dark:text-brand-300",
    },
  ];
}

function trustItems() {
  return [
    t("hero.trust1"),
    t("hero.trust2"),
    t("hero.trust3"),
    t("hero.trust4"),
  ];
}

function stats() {
  return [
    { value: t("hero.stat1Value"), label: t("hero.stat1Label") },
    { value: t("hero.stat2Value"), label: t("hero.stat2Label") },
    { value: t("hero.stat3Value"), label: t("hero.stat3Label") },
    { value: t("hero.stat4Value"), label: t("hero.stat4Label") },
  ];
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="from-brand-50/80 dark:from-brand-950/40 dark:via-ink-950 dark:to-ink-950 absolute inset-0 bg-linear-to-b via-white to-white" />
      <div className="bg-brand-500/20 dark:bg-brand-600/25 absolute -top-48 left-1/2 h-136 w-216 -translate-x-1/2 rounded-full blur-[130px]" />
      <div className="animate-drift bg-accent-500/15 absolute top-44 -left-24 h-72 w-72 rounded-full blur-[110px]" />
      <div className="animate-drift bg-g-yellow-400/15 absolute right-0 bottom-0 h-80 w-80 rounded-full blur-[120px] [animation-delay:-11s]" />
      <div
        className={`absolute inset-0 ${gridPattern} mask-[radial-gradient(ellipse_65%_55%_at_50%_35%,black,transparent)]`}
      />
    </div>
  );
}

function FloatingBadge({ card }: { readonly card: FloatingCard }) {
  return (
    <enter-effect
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      duration={0.6}
      delay={card.delay}
      className={`dark:bg-ink-900/90 shadow-card absolute z-20 hidden items-center gap-2.5 rounded-2xl border bg-white/90 px-3.5 py-2.5 backdrop-blur md:flex dark:shadow-black/40 ${line} ${card.className}`}
    >
      <loop-effect
        keyframes={{ y: [0, -4, 0] }}
        duration={4}
        className="bg-brand-100/70 grid size-8 place-items-center rounded-xl dark:bg-white/5"
      >
        <Icon name={card.icon} className={`size-4 ${card.accent}`} />
      </loop-effect>
      <span className="leading-tight">
        <span className={`block text-xs font-bold ${heading}`}>
          {card.title}
        </span>
        <span className={`block text-[10px] font-medium ${faint}`}>
          {card.subtitle}
        </span>
      </span>
    </enter-effect>
  );
}

export function Hero() {
  const cards = floatingCards();
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 sm:pt-36">
      <HeroBackdrop />
      <div className={container}>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="min-w-0">
            <ui-reveal>
              <a
                href="#features"
                onClick={(event) => handleAnchorClick(event, "#features")}
                className="group border-brand-300/60 text-brand-700 hover:border-brand-400 dark:border-brand-400/25 dark:bg-brand-500/10 dark:text-brand-200 inline-flex max-w-full items-center gap-2 rounded-full border bg-white/70 py-2 pr-4 pl-1.5 text-xs font-semibold shadow-sm backdrop-blur transition"
              >
                <span className="bg-brand-600 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white">
                  <Icon name="sparkles" className="size-3" />
                  v0.0.7
                </span>
                <span className="min-w-0">{t("hero.badge")}</span>
                <Icon
                  name="arrow-right"
                  className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </a>
            </ui-reveal>

            <ui-reveal delay={0.05}>
              <h1
                className={`mt-7 text-4xl font-black tracking-tight text-balance sm:text-6xl lg:text-7xl ${heading}`}
              >
                {t("hero.titleLine1")}
                <br />
                <span className={gradientText}>{t("hero.titleAccent")}</span>
              </h1>
            </ui-reveal>

            <ui-reveal delay={0.12}>
              <p
                className={`mt-6 max-w-xl text-lg leading-relaxed text-pretty ${muted}`}
              >
                {t("hero.description")}
              </p>
            </ui-reveal>

            <ui-reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#quickstart"
                  onClick={(event) => handleAnchorClick(event, "#quickstart")}
                  className={`group ${primaryButton} inline-flex px-6 py-3`}
                >
                  {t("hero.getStarted")}
                  <Icon
                    name="arrow-right"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </a>
                <a
                  href="https://github.com/hangtiancheng/yukino-sentry"
                  target="_blank"
                  rel="noreferrer"
                  className={`${secondaryButton} inline-flex px-6 py-3`}
                >
                  <GithubIcon className="size-4" />
                  {t("hero.starGithub")}
                </a>
              </div>
            </ui-reveal>

            <ui-reveal delay={0.24}>
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
                {trustItems().map((item) => (
                  <li
                    key={item}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${faint}`}
                  >
                    <Icon
                      name="check"
                      className="text-g-green-600 dark:text-g-green-300 size-3.5"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </ui-reveal>
          </div>

          <div className="relative">
            <FloatingBadge card={cards[0]!} />
            <FloatingBadge card={cards[1]!} />
            <FloatingBadge card={cards[2]!} />
            <enter-effect
              initial={{ opacity: 0, y: 30, rotateX: 8 }}
              duration={0.8}
              delay={0.15}
              className="relative z-10"
            >
              <div className="from-brand-500/25 to-g-yellow-400/25 absolute -inset-4 -z-10 rounded-4xl bg-linear-to-br via-transparent blur-2xl" />
              <code-block
                code={HERO_CODE}
                filename="src/main.ts"
                showLineNumbers
              />
            </enter-effect>
          </div>
        </div>

        <ui-reveal delay={0.2} className="mt-20">
          <dl
            className={`grid grid-cols-2 gap-px overflow-hidden rounded-3xl border bg-[#dadce0] lg:grid-cols-4 ${line} dark:bg-white/10`}
          >
            {stats().map((stat) => (
              <div
                key={stat.label}
                className="dark:bg-ink-950 flex flex-col-reverse bg-white px-6 py-6 text-center"
              >
                <dt
                  className={`mt-1 text-xs font-semibold tracking-wide uppercase ${faint}`}
                >
                  {stat.label}
                </dt>
                <dd className="from-brand-600 to-brand-400 bg-linear-to-r bg-clip-text text-3xl font-black text-transparent">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </ui-reveal>
      </div>
    </section>
  );
}
