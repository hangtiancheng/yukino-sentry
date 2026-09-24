import { LitElement, customElement, state } from "@yukino.js/lit-jsx";
import { animate } from "motion";
import { cn } from "@/lib/cn";
import { FAQ_IDS, REPO_URL } from "@/lib/data";
import type { FaqId } from "@/lib/data";
import { LocaleController, t } from "@/lib/i18n";
import { EASE, reducedMotion } from "@/lib/motion";
import { Icon } from "@/components/icons/icon";
import {
  container,
  eyebrow as eyebrowClass,
  gradientText,
  heading,
  line,
  muted,
} from "@/lib/styles";
import { Section } from "@/components/ui/section";

declare global {
  interface HTMLElementTagNameMap {
    "site-faq": FaqElement;
  }
}

@customElement("site-faq")
export class FaqElement extends LitElement {
  @state() private openIndex: number | null = 0;

  private generation = 0;

  locale = new LocaleController(this);

  override createRenderRoot(): HTMLElement {
    return this;
  }

  override firstUpdated(): void {
    if (this.openIndex === null) return;
    const el = this.querySelector<HTMLElement>(
      `[data-answer="${this.openIndex}"]`,
    );
    if (el && !reducedMotion()) {
      animate(
        el,
        { height: [0, "auto"], opacity: [0, 1] },
        { duration: 0.28, ease: EASE },
      );
    }
  }

  private async toggle(index: number): Promise<void> {
    const generation = ++this.generation;
    if (this.openIndex === index) {
      const el = this.querySelector<HTMLElement>(`[data-answer="${index}"]`);
      if (el && !reducedMotion()) {
        await animate(
          el,
          { height: 0, opacity: 0 },
          { duration: 0.28, ease: EASE },
        ).finished;
      }
      if (generation === this.generation && this.openIndex === index) {
        this.openIndex = null;
      }
      return;
    }

    const previous = this.openIndex;
    if (previous !== null) {
      const old = this.querySelector<HTMLElement>(
        `[data-answer="${previous}"]`,
      );
      if (old && !reducedMotion()) {
        await animate(
          old,
          { height: 0, opacity: 0 },
          { duration: 0.2, ease: EASE },
        ).finished;
      }
      if (generation !== this.generation) return;
    }

    this.openIndex = index;
    await this.updateComplete;
    if (generation !== this.generation) return;
    const el = this.querySelector<HTMLElement>(`[data-answer="${index}"]`);
    if (el && !reducedMotion()) {
      animate(
        el,
        { height: [0, "auto"], opacity: [0, 1] },
        { duration: 0.28, ease: EASE },
      );
    }
  }

  override render() {
    return (
      <Section id="faq" className="bg-[#f8f9fa] dark:bg-white/2">
        <div
          className={cn(
            container,
            "grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr]",
          )}
        >
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ui-reveal>
              <span className={eyebrowClass}>{t("faq.eyebrow")}</span>
              <h2
                className={cn(
                  "mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl",
                  heading,
                )}
              >
                {t("faq.titleA")}
                <span className={`block ${gradientText}`}>
                  {t("faq.titleHighlight")}
                </span>
              </h2>
              <p
                className={cn(
                  "mt-5 text-sm leading-relaxed sm:text-base",
                  muted,
                )}
              >
                {t("faq.bodyA")}{" "}
                <a
                  href={`${REPO_URL}/issues`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:text-brand-500 dark:text-brand-300 dark:hover:text-brand-200 font-medium transition-colors"
                >
                  GitHub Issues
                </a>{" "}
                {t("faq.bodyB")}
              </p>
            </ui-reveal>
          </div>

          <div className="space-y-3">
            {FAQ_IDS.map((id: FaqId, index) => {
              const isOpen = this.openIndex === index;
              return (
                <ui-reveal key={id} delay={index * 0.05}>
                  <div
                    className={cn(
                      "overflow-hidden rounded-2xl border transition-colors",
                      isOpen
                        ? "border-brand-500/30 bg-brand-500/4"
                        : cn("bg-white dark:bg-[#1e1f20]", line),
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => void this.toggle(index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${index}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span
                        className={cn("text-[15px] font-semibold", heading)}
                      >
                        {t(`faq.items.${id}.question`)}
                      </span>
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full transition-colors",
                          isOpen
                            ? "bg-brand-500 text-white"
                            : "bg-brand-500/10 text-[#5f6368] dark:bg-white/6 dark:text-[#9aa0a6]",
                        )}
                      >
                        <Icon
                          name={isOpen ? "minus" : "plus"}
                          className="size-3.5"
                        />
                      </span>
                    </button>
                    {isOpen ? (
                      <div
                        data-answer={String(index)}
                        id={`faq-a-${index}`}
                        role="region"
                        className="overflow-hidden opacity-0"
                      >
                        <p
                          className={cn(
                            "px-5 pb-5 text-sm leading-relaxed",
                            muted,
                          )}
                        >
                          {t(`faq.items.${id}.answer`)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </ui-reveal>
              );
            })}
          </div>
        </div>
      </Section>
    );
  }
}
