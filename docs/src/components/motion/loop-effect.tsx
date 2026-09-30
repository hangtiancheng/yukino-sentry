import { LitElement, customElement, property } from "@yukino.js/lit-jsx";
import { animate } from "motion";
import type { DOMKeyframesDefinition } from "motion";

import { reducedMotion } from "@/lib/motion";

declare global {
  interface HTMLElementTagNameMap {
    "loop-effect": LoopEffectElement;
  }
}

/**
 * Infinite ambient animation (blob drift, cursor blink, floating icons).
 * Disabled when the user prefers reduced motion.
 */
@customElement("loop-effect")
export class LoopEffectElement extends LitElement {
  @property({ attribute: false })
  keyframes: Record<string, (string | number)[]> = {};
  @property({ type: Number }) duration = 4;
  @property() ease: "linear" | "easeInOut" = "easeInOut";

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  protected override firstUpdated(): void {
    if (reducedMotion()) {
      return;
    }
    animate(this, this.keyframes as DOMKeyframesDefinition, {
      duration: this.duration,
      repeat: Infinity,
      ease: this.ease,
    });
  }
}
