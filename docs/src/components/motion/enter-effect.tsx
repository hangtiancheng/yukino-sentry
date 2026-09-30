import { LitElement, customElement, property } from "@yukino.js/lit-jsx";
import { animate, inView } from "motion";
import type { DOMKeyframesDefinition } from "motion";

import { EASE, reducedMotion } from "@/lib/motion";

declare global {
  interface HTMLElementTagNameMap {
    "enter-effect": EnterEffectElement;
  }
}

type KeyframeValue = string | number;

const TRANSFORM_KEYS = new Set([
  "x",
  "y",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
]);

const IDENTITY: Record<string, KeyframeValue> = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  rotateX: 0,
};

function omitTransforms(
  values: Record<string, KeyframeValue>,
): Record<string, KeyframeValue> {
  const result: Record<string, KeyframeValue> = {};
  for (const [key, value] of Object.entries(values)) {
    if (!TRANSFORM_KEYS.has(key)) {
      result[key] = value;
    }
  }
  return result;
}

function applyInitial(
  el: HTMLElement,
  values: Record<string, KeyframeValue>,
): void {
  const transforms: string[] = [];
  for (const [key, value] of Object.entries(values)) {
    switch (key) {
      case "x":
      case "y": {
        const distance = typeof value === "number" ? `${value}px` : value;
        transforms.push(`translate${key === "x" ? "X" : "Y"}(${distance})`);
        break;
      }
      case "scale":
      case "scaleX":
      case "scaleY":
        transforms.push(`${key}(${value})`);
        break;
      case "rotate":
        transforms.push(`rotate(${value}deg)`);
        break;
      case "rotateX":
        transforms.push(`perspective(1200px) rotateX(${value}deg)`);
        break;
      default:
        el.style.setProperty(key, String(value));
    }
  }
  if (transforms.length > 0) {
    el.style.transform = transforms.join(" ");
  }
}

/**
 * Mount-time entrance animation: applies the `initial` keyframes immediately
 * (no flash of the final state), then animates to their identity values
 * merged with any explicit `to` overrides. With `viewport`, playback waits
 * for the element to scroll into view.
 */
@customElement("enter-effect")
export class EnterEffectElement extends LitElement {
  @property({ attribute: false }) initial: Record<string, KeyframeValue> = {};
  @property({ attribute: false }) to: Record<string, KeyframeValue> = {};
  @property({ type: Number }) duration = 0.6;
  @property({ type: Number }) delay = 0;
  @property({ type: Boolean }) viewport = false;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    applyInitial(
      this,
      reducedMotion() ? omitTransforms(this.initial) : this.initial,
    );
  }

  protected override firstUpdated(): void {
    const reduce = reducedMotion();
    const initial = reduce ? omitTransforms(this.initial) : this.initial;
    const target: Record<string, KeyframeValue> = {};
    for (const key of Object.keys(initial)) {
      target[key] = IDENTITY[key] ?? 0;
    }
    Object.assign(target, reduce ? omitTransforms(this.to) : this.to);

    const play = () => {
      animate(this, target as DOMKeyframesDefinition, {
        duration: this.duration,
        delay: this.delay,
        ease: EASE,
      });
    };

    if (this.viewport) {
      const stop = inView(
        this,
        () => {
          play();
          stop();
        },
        { margin: "-80px" },
      );
    } else {
      play();
    }
  }
}
