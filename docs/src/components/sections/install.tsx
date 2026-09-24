import { LitElement, customElement, state } from "@yukino.js/lit-jsx";
import { animate } from "motion";
import { cn } from "@/lib/cn";
import { INSTALL_COMMAND, REPO_URL } from "@/lib/data";
import { LocaleController, t } from "@/lib/i18n";
import { EASE, reducedMotion } from "@/lib/motion";
import { Icon } from "@/components/icons/icon";
import { GithubIcon } from "@/components/icons/github-icon";
import { TAB_REACT_CODE, TAB_VANILLA_CODE, TAB_VUE_CODE } from "./snippets";
import {
  container,
  gridPattern,
  heading,
  primaryButton,
  secondaryButton,
} from "@/lib/styles";
import { CommandBar } from "@/components/ui/copy-button";
import { Section, SectionHeader } from "@/components/ui/section";

type TabId = "vanilla" | "react" | "vue";

interface InstallTab {
  readonly id: TabId;
  readonly labelKey:
    "install.tabVanilla" | "install.tabReact" | "install.tabVue";
  readonly filename: string;
  readonly code: string;
}

const TABS: readonly InstallTab[] = [
  {
    id: "vanilla",
    labelKey: "install.tabVanilla",
    filename: "src/main.ts",
    code: TAB_VANILLA_CODE,
  },
  {
    id: "react",
    labelKey: "install.tabReact",
    filename: "src/App.tsx",
    code: TAB_REACT_CODE,
  },
  {
    id: "vue",
    labelKey: "install.tabVue",
    filename: "src/main.js",
    code: TAB_VUE_CODE,
  },
];

declare global {
  interface HTMLElementTagNameMap {
    "site-install": InstallElement;
  }
}

@customElement("site-install")
export class InstallElement extends LitElement {
  @state() private active: TabId = "vanilla";

  private swapping = false;

  locale = new LocaleController(this);

  override createRenderRoot(): HTMLElement {
    return this;
  }

  private async selectTab(id: TabId): Promise<void> {
    if (id === this.active || this.swapping) return;
    this.swapping = true;
    const panel = this.querySelector<HTMLElement>("[data-code-panel]");
    if (panel && !reducedMotion()) {
      await animate(
        panel,
        { opacity: 0, y: -8 },
        { duration: 0.18, ease: EASE },
      ).finished;
    }
    this.active = id;
    await this.updateComplete;
    const next = this.querySelector<HTMLElement>("[data-code-panel]");
    if (next && !reducedMotion()) {
      next.style.opacity = "0";
      animate(
        next,
        { opacity: [0, 1], y: [10, 0] },
        { duration: 0.28, ease: EASE },
      );
    }
    this.swapping = false;
  }

  override render() {
    const tab = TABS.find((item) => item.id === this.active) ?? TABS[0]!;
    return (
      <Section id="install" className="overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className={cn("absolute inset-0", gridPattern, "opacity-60")} />
          <div className="bg-brand-500/15 dark:bg-brand-600/20 absolute top-10 left-1/2 h-104 w-208 -translate-x-1/2 rounded-full blur-[130px]" />
        </div>

        <SectionHeader
          eyebrow={t("install.eyebrow")}
          titleA={t("install.titleA")}
          titleHighlight={t("install.titleHighlight")}
          description={t("install.description")}
        />

        <ui-reveal delay={0.08} className={cn(container, "relative mt-12")}>
          <div className="shadow-card mx-auto max-w-3xl rounded-3xl border border-[#dadce0] bg-white/80 p-6 backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-white/3 dark:shadow-none">
            <CommandBar command={INSTALL_COMMAND} />

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {TABS.map((item) => {
                const selected = item.id === this.active;
                return (
                  <button
                    type="button"
                    onClick={() => void this.selectTab(item.id)}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "bg-brand-600 dark:bg-brand-300 dark:text-brand-950 text-white"
                        : "hover:bg-brand-500/10 hover:text-brand-900 text-[#5f6368] dark:text-[#9aa0a6] dark:hover:bg-white/6 dark:hover:text-white",
                    )}
                  >
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </div>

            <div data-code-panel className="mt-4">
              <code-block code={tab.code} filename={tab.filename} />
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#80868b] dark:text-[#9aa0a6]">
              <li className="inline-flex items-center gap-1.5">
                <Icon name="check" className="text-g-green-600 size-3.5" />
                {t("install.checks1")}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Icon name="check" className="text-g-green-600 size-3.5" />
                {t("install.checks2")}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Icon name="check" className="text-g-green-600 size-3.5" />
                {t("install.checks3")}
              </li>
            </ul>
          </div>
        </ui-reveal>

        <ui-reveal delay={0.12} className={cn(container, "relative mt-16")}>
          <div className="border-brand-500/15 bg-brand-50 relative overflow-hidden rounded-3xl border px-6 py-12 text-center sm:px-12 sm:py-16 dark:border-transparent dark:bg-white/4">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <div className="bg-brand-500/20 dark:bg-brand-500/25 absolute -top-24 left-1/2 h-72 w-160 -translate-x-1/2 rounded-full blur-[110px]" />
              <div className="bg-accent-500/15 dark:bg-accent-500/20 absolute right-0 -bottom-24 size-64 rounded-full blur-[110px]" />
            </div>
            <div className="relative">
              <h2
                className={cn(
                  "text-3xl font-semibold tracking-[-0.03em] sm:text-4xl",
                  heading,
                )}
              >
                {t("install.ctaTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-[#5f6368] sm:text-base dark:text-[#9aa0a6]">
                {t("install.ctaBody")}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="https://www.npmjs.com/package/@yukino.js/sentry"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(primaryButton, "w-full sm:w-auto")}
                >
                  {t("install.ctaPrimary")}
                  <Icon name="arrow-right" className="size-4" />
                </a>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(secondaryButton, "w-full sm:w-auto")}
                >
                  <GithubIcon className="size-4" />
                  {t("install.ctaSecondary")}
                </a>
              </div>
            </div>
          </div>
        </ui-reveal>
      </Section>
    );
  }
}
