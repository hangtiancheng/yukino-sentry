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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(280px_circle_at_var(--spot-x,50%)_var(--spot-y,50%),rgba(66,133,244,0.14),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
}
