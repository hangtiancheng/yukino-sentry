/**
 * Card wrapper that tracks the pointer and paints a soft radial spotlight
 * behind the content on hover. Purely decorative: the overlay is
 * pointer-events-none and hidden from assistive tech.
 *
 * Children land in a relative flex-col wrapper so they always paint above the
 * absolute overlay; pass layout classes (padding, radius, card recipes) via
 * className on the outer element.
 */
export function SpotlightCard({
  children,
  className,
}: {
  readonly children?: unknown;
  readonly className?: string;
}) {
  const handleMove = (event: MouseEvent): void => {
    const el = event.currentTarget as HTMLElement | null;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      onMouseMove={handleMove}
      className={`group relative overflow-hidden ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(280px_circle_at_var(--spot-x,50%)_var(--spot-y,50%),rgba(137,82,246,0.14),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
}
