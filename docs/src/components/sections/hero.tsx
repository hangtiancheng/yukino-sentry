import { GithubIcon } from "@/components/icons/github-icon";
import { Icon } from "@/components/icons/icon";
import { INSTALL_COMMAND, REPO_URL } from "@/lib/data";
import { t } from "@/lib/i18n";
import { handleAnchorClick } from "@/lib/scroll";
import {
  container,
  gradientText,
  gridPattern,
  heading,
  muted,
  primaryButton,
  secondaryButton,
} from "@/lib/styles";
import { CommandBar } from "@/components/ui/copy-button";

function quickChips(): readonly {
  readonly dot: string;
  readonly label: string;
}[] {
  return [
    { dot: "bg-brand-500", label: t("hero.quick1") },
    { dot: "bg-g-green-500", label: t("hero.quick2") },
    { dot: "bg-g-yellow-400", label: t("hero.quick3") },
  ];
}

function stats(): readonly {
  readonly value: string;
  readonly label: string;
}[] {
  return [
    { value: t("hero.stat1Value"), label: t("hero.stat1Label") },
    { value: t("hero.stat2Value"), label: t("hero.stat2Label") },
    { value: t("hero.stat3Value"), label: t("hero.stat3Label") },
    { value: t("hero.stat4Value"), label: t("hero.stat4Label") },
  ];
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        className={`absolute inset-0 ${gridPattern} mask-[radial-gradient(ellipse_65%_55%_at_50%_0%,black,transparent)] [-webkit-mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,black,transparent)]`}
      />
      <div className="animate-drift bg-brand-500/20 dark:bg-brand-600/25 absolute -top-52 left-1/2 h-136 w-5xl -translate-x-1/2 rounded-full blur-[130px]" />
      <div className="animate-floaty bg-accent-400/15 dark:bg-accent-500/10 absolute top-32 -right-40 h-104 w-104 rounded-full blur-[120px]" />
      <div className="animate-floaty bg-brand-400/15 dark:bg-brand-500/12 absolute top-64 -left-32 h-88 w-88 rounded-full blur-[120px] [animation-delay:1.5s]" />
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24"
    >
      <HeroBackdrop />
      <div className={`${container} relative text-center`}>
        <ui-reveal>
          <div className="flex justify-center">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="group border-brand-500/20 bg-brand-500/[0.07] text-brand-700 hover:border-brand-500/40 hover:bg-brand-500/12 dark:border-brand-300/20 dark:bg-brand-400/9 dark:text-brand-200 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur transition-colors sm:text-[13px]"
            >
              <Icon name="sparkles" className="size-3.5" />
              <span className="font-semibold">{t("hero.badge")}</span>
              <span className="opacity-80">{t("hero.badgeNote")}</span>
              <span className="inline-flex items-center gap-1 font-semibold">
                {t("common.starOnGithub")}
                <Icon
                  name="arrow-right"
                  className="size-3 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </a>
          </div>
        </ui-reveal>

        <ui-reveal delay={0.05}>
          <h1
            className={`mx-auto mt-8 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-6xl md:text-7xl ${heading}`}
          >
            {t("hero.titleA")}
            <span className={`block ${gradientText}`}>
              {t("hero.titleHighlight")}
            </span>
          </h1>
        </ui-reveal>

        <ui-reveal delay={0.1}>
          <p
            className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg ${muted}`}
          >
            {t("hero.subtitle")}
          </p>
        </ui-reveal>

        <ui-reveal delay={0.15}>
          <div className="mx-auto mt-9 max-w-xl">
            <CommandBar command={INSTALL_COMMAND} />
          </div>
        </ui-reveal>

        <ui-reveal delay={0.2}>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#install"
              onClick={(event) => handleAnchorClick(event, "#install")}
              className={`group w-full sm:w-auto ${primaryButton}`}
            >
              {t("hero.getStarted")}
              <Icon
                name="arrow-right"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className={`w-full sm:w-auto ${secondaryButton}`}
            >
              <GithubIcon className="size-4" />
              {t("hero.starGithub")}
              <Icon name="star" className="text-g-yellow-400 size-3.5" />
            </a>
          </div>
        </ui-reveal>

        <ui-reveal delay={0.25}>
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {quickChips().map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 rounded-full border border-[#dadce0] bg-white/60 px-3 py-1.5 font-mono text-[11px] text-[#5f6368] backdrop-blur sm:text-xs dark:border-white/8 dark:bg-white/3 dark:text-[#9aa0a6]"
              >
                <span className={`size-1.5 rounded-full ${item.dot}`} />
                {item.label}
              </li>
            ))}
          </ul>
        </ui-reveal>

        <ui-reveal delay={0.3}>
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {stats().map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1"
              >
                <dt
                  className={`text-3xl font-semibold tracking-tight sm:text-4xl ${heading}`}
                >
                  {stat.value}
                </dt>
                <dd className="text-xs font-medium tracking-[0.14em] text-[#80868b] uppercase dark:text-[#9aa0a6]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </ui-reveal>
      </div>
    </section>
  );
}
