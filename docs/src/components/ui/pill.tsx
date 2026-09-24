import { Icon } from "@/components/icons/icon";

export function Pill({
  children,
  icon,
  className,
}: {
  readonly children?: unknown;
  readonly icon?: string;
  readonly className?: string;
}) {
  return (
    <span
      className={`text-brand-700 shadow-soft dark:border-brand-400/25 dark:bg-brand-500/10 dark:text-brand-200 inline-flex items-center gap-2 rounded-full border border-[#dadce0] bg-white/80 px-3.5 py-1.5 text-xs font-semibold backdrop-blur dark:text-slate-200 dark:shadow-none ${className ?? ""}`}
    >
      {icon ? <Icon name={icon} className="size-3.5" /> : null}
      {children}
    </span>
  );
}

export function MonoTag({
  children,
  className,
}: {
  readonly children?: unknown;
  readonly className?: string;
}) {
  return (
    <code
      className={`border-brand-200/70 bg-brand-50 text-brand-700 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-200 rounded-md border px-1.5 py-0.5 font-mono text-[0.8em] font-medium ${className ?? ""}`}
    >
      {children}
    </code>
  );
}
