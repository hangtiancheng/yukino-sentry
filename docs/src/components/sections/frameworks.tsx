import {
  createRef,
  LitElement,
  customElement,
  state,
} from "@yukino.js/lit-jsx";
import { animate } from "motion";

import { Icon } from "@/components/icons/icon";
import { Section } from "@/components/ui/section";
import { LocaleController, t } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { brandGradient, card, heading, muted } from "@/lib/styles";
import { TAB_REACT_CODE, TAB_VANILLA_CODE, TAB_VUE_CODE } from "./snippets";

declare global {
  interface HTMLElementTagNameMap {
    "frameworks-section": FrameworksSectionElement;
  }
}

type FrameworkKey = "vanilla" | "react" | "vue";

interface FrameworkTab {
  readonly key: FrameworkKey;
  readonly label: string;
  readonly icon: string;
  readonly filename: string;
  readonly code: string;
  readonly noteKey:
    "frameworks.noteVanilla" | "frameworks.noteReact" | "frameworks.noteVue";
}

const TABS: readonly FrameworkTab[] = [
  {
    key: "vanilla",
    label: "Vanilla",
    icon: "boxes",
    filename: "main.ts",
    code: TAB_VANILLA_CODE,
    noteKey: "frameworks.noteVanilla",
  },
  {
    key: "react",
    label: "React",
    icon: "component",
    filename: "app.tsx",
    code: TAB_REACT_CODE,
    noteKey: "frameworks.noteReact",
  },
  {
    key: "vue",
    label: "Vue 3",
    icon: "layers",
    filename: "main.ts",
    code: TAB_VUE_CODE,
    noteKey: "frameworks.noteVue",
  },
];

function highlights() {
  return [
    {
      title: t("frameworks.highlight1Title"),
      body: t("frameworks.highlight1Body"),
    },
    {
      title: t("frameworks.highlight2Title"),
      body: t("frameworks.highlight2Body"),
    },
    {
      title: t("frameworks.highlight3Title"),
      body: t("frameworks.highlight3Body"),
    },
  ];
}

@customElement("frameworks-section")
export class FrameworksSectionElement extends LitElement {
  @state() private active: FrameworkKey = "react";

  locale = new LocaleController(this);

  private indicatorRef = createRef<HTMLSpanElement>();
  private noteRef = createRef<HTMLParagraphElement>();
  private codeWrapRef = createRef<HTMLDivElement>();

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  private handleResize = (): void => {
    this.moveIndicator(false);
  };

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("resize", this.handleResize);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("resize", this.handleResize);
  }

  protected override firstUpdated(): void {
    this.moveIndicator(false);
  }

  private select(key: FrameworkKey): void {
    if (key === this.active) {
      return;
    }
    this.active = key;
    this.moveIndicator(true);
    void this.updateComplete.then(() => {
      if (this.noteRef.value) {
        animate(
          this.noteRef.value,
          { opacity: [0, 1], y: [8, 0] },
          { duration: 0.25 },
        );
      }
      if (this.codeWrapRef.value) {
        animate(
          this.codeWrapRef.value,
          { opacity: [0, 1], y: [12, 0] },
          { duration: 0.3, ease: EASE },
        );
      }
    });
  }

  private moveIndicator(withSpring: boolean): void {
    void this.updateComplete.then(() => {
      const indicator = this.indicatorRef.value;
      const button = this.querySelector<HTMLElement>(
        `[data-key="${this.active}"]`,
      );
      if (!indicator || !button) {
        return;
      }
      if (withSpring) {
        animate(
          indicator,
          { x: button.offsetLeft, width: button.offsetWidth },
          { type: "spring", stiffness: 320, damping: 30 },
        );
      } else {
        indicator.style.transform = `translateX(${button.offsetLeft}px)`;
        indicator.style.width = `${button.offsetWidth}px`;
      }
    });
  }

  protected override render() {
    const current = TABS.find((tab) => tab.key === this.active) ?? TABS[0]!;

    return (
      <Section
        id="frameworks"
        eyebrow={t("frameworks.eyebrow")}
        title={t("frameworks.title")}
        accent={t("frameworks.accent")}
        description={t("frameworks.description")}
      >
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <ui-reveal>
            <div className="flex flex-col gap-2">
              <div
                className={`${card} relative inline-flex rounded-full p-1.5`}
              >
                {TABS.map((tab) => {
                  const isActive = tab.key === this.active;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      data-key={tab.key}
                      onClick={() => this.select(tab.key)}
                      className="relative z-10 flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-xs font-bold transition sm:gap-2 sm:px-4 sm:text-sm"
                    >
                      <span
                        className={`flex items-center gap-2 ${
                          isActive
                            ? "text-white"
                            : "text-[#5f6368] dark:text-slate-300"
                        }`}
                      >
                        <Icon
                          name={tab.icon}
                          className="hidden size-4 sm:block"
                        />
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
                <span
                  ref={this.indicatorRef}
                  className={`${brandGradient} shadow-brand-500/25 pointer-events-none absolute inset-y-1.5 left-0 w-0 rounded-full shadow-lg`}
                />
              </div>

              <div className={`${card} rounded-2xl p-5`}>
                <p
                  ref={this.noteRef}
                  className={`text-sm leading-relaxed ${muted}`}
                >
                  {t(current.noteKey)}
                </p>
              </div>

              <div className="mt-2 space-y-3">
                {highlights().map((item, index) => (
                  <div key={index} className={`${card} rounded-2xl p-4`}>
                    <p className={`text-sm font-bold ${heading}`}>
                      {item.title}
                    </p>
                    <p className={`mt-1 text-sm leading-relaxed ${muted}`}>
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ui-reveal>

          <ui-reveal delay={0.1}>
            <div ref={this.codeWrapRef}>
              <code-block
                code={current.code}
                filename={current.filename}
                showLineNumbers
              />
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              <Icon
                name="triangle-alert"
                className="text-g-yellow-500 mt-0.5 size-3.5 shrink-0"
              />
              {t("frameworks.warning")}
            </p>
          </ui-reveal>
        </div>
      </Section>
    );
  }
}
