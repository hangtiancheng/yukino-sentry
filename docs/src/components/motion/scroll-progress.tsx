import { LitElement, customElement, state } from "@yukino.js/lit-jsx";
import { animate, scroll } from "motion";

import { Icon } from "@/components/icons/icon";
import { EASE, reducedMotion } from "@/lib/motion";

declare global {
  interface HTMLElementTagNameMap {
    "scroll-progress": ScrollProgressElement;
  }
}

@customElement("scroll-progress")
export class ScrollProgressElement extends LitElement {
  @state() private button: "hidden" | "entering" | "shown" | "leaving" =
    "hidden";

  private stopScroll?: () => void;
  private bar?: HTMLElement | null;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  protected override firstUpdated(): void {
    this.bar = this.querySelector<HTMLElement>("[data-progress-bar]");
    if (this.bar) {
      this.bar.style.transform = "scaleX(0)";
    }
    this.stopScroll = scroll((progress: number) => {
      if (this.bar) {
        this.bar.style.transform = `scaleX(${progress})`;
      }
      const shouldShow = window.scrollY > 800;
      if (shouldShow && this.button === "hidden") {
        this.showButton();
      } else if (!shouldShow && this.button === "shown") {
        this.hideButton();
      }
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopScroll?.();
  }

  private showButton(): void {
    this.button = "entering";
    void this.updateComplete.then(() => {
      const el = this.querySelector<HTMLElement>("[data-back-top]");
      if (el) {
        animate(
          el,
          { opacity: [0, 1], y: [12, 0], scale: [0.9, 1] },
          { duration: reducedMotion() ? 0 : 0.22, ease: EASE },
        );
      }
      this.button = "shown";
    });
  }

  private hideButton(): void {
    this.button = "leaving";
    const el = this.querySelector<HTMLElement>("[data-back-top]");
    const finish = (): void => {
      if (this.button === "leaving") {
        this.button = "hidden";
      }
    };
    if (el) {
      void animate(
        el,
        { opacity: 0, y: 12, scale: 0.9 },
        { duration: reducedMotion() ? 0 : 0.22, ease: EASE },
      ).finished.then(finish);
    } else {
      finish();
    }
  }

  protected override render() {
    return (
      <>
        <div
          data-progress-bar
          aria-hidden="true"
          className="from-brand-600 to-brand-400 fixed inset-x-0 top-0 z-60 h-0.5 origin-left bg-linear-to-r"
        />
        {this.button !== "hidden" ? (
          <button
            data-back-top
            type="button"
            aria-label="Back to top"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: reducedMotion() ? "auto" : "smooth",
              });
            }}
            className="hover:text-brand-600 dark:hover:text-brand-200 fixed right-4 bottom-4 z-50 grid size-11 place-items-center rounded-full border border-[#dadce0] bg-white/85 text-[#5f6368] opacity-0 shadow-lg backdrop-blur transition-colors sm:right-6 sm:bottom-6 dark:border-white/10 dark:bg-white/6 dark:text-[#9aa0a6]"
          >
            <Icon name="arrow-up" className="size-4" />
          </button>
        ) : null}
      </>
    );
  }
}
