import { LitElement, customElement, property } from "@yukino.js/lit-jsx";
import { animate, inView } from "motion";

import { EASE, reducedMotion } from "@/lib/motion";

declare global {
  interface HTMLElementTagNameMap {
    "ui-reveal": RevealElement;
    "ui-reveal-item": RevealItemElement;
    "ui-reveal-list": RevealListElement;
  }
}

@customElement("ui-reveal")
export class RevealElement extends LitElement {
  @property({ type: Number }) delay = 0;
  @property({ type: Number }) y = 26;
  @property({ type: Boolean }) once = true;

  private stop?: () => void;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.style.opacity = "0";
    if (!reducedMotion()) {
      this.style.transform = `translateY(${this.y}px)`;
    }
  }

  protected override firstUpdated(): void {
    this.stop = inView(
      this,
      () => {
        animate(
          this,
          { opacity: 1, y: 0 },
          { duration: 0.65, delay: this.delay, ease: EASE },
        );
        if (this.once) {
          this.stop?.();
        }
      },
      { margin: "-90px" },
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stop?.();
  }
}

@customElement("ui-reveal-list")
export class RevealListElement extends LitElement {
  @property({ type: Number }) stagger = 0.08;

  private stop?: () => void;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  protected override firstUpdated(): void {
    const items = Array.from(this.children).filter(
      (child): child is RevealItemElement => child instanceof RevealItemElement,
    );
    this.stop = inView(
      this,
      () => {
        const reduce = reducedMotion();
        items.forEach((item, index) => {
          animate(
            item,
            { opacity: 1, y: 0 },
            {
              duration: 0.6,
              delay: reduce ? 0 : index * this.stagger,
              ease: EASE,
            },
          );
        });
        this.stop?.();
      },
      { margin: "-80px" },
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stop?.();
  }
}

@customElement("ui-reveal-item")
export class RevealItemElement extends LitElement {
  @property({ type: Number }) y = 24;

  private stop?: () => void;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.style.opacity = "0";
    if (!reducedMotion()) {
      this.style.transform = `translateY(${this.y}px)`;
    }
  }

  protected override firstUpdated(): void {
    // Items inside a ui-reveal-list are staggered by their parent; standalone
    // items would otherwise never be animated and stay invisible.
    if (this.closest("ui-reveal-list")) {
      return;
    }
    this.stop = inView(
      this,
      () => {
        animate(this, { opacity: 1, y: 0 }, { duration: 0.6, ease: EASE });
        this.stop?.();
      },
      { margin: "-80px" },
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stop?.();
  }
}
