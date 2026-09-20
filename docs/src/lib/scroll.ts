import { reducedMotion } from "./motion";

export function scrollToId(href: string): void {
  if (!href.startsWith("#")) {
    return;
  }
  const target = document.querySelector(href);
  if (target) {
    target.scrollIntoView({
      behavior: reducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }
}

export function handleAnchorClick(
  event: { preventDefault: () => void },
  href: string,
): void {
  if (!href.startsWith("#")) {
    return;
  }
  event.preventDefault();
  scrollToId(href);
}
