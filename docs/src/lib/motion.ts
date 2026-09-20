export const EASE = [0.22, 1, 0.36, 1] as const;

export function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
