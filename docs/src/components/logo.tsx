import { Icon } from "@/components/icons/icon";

export function Logo({ compact = false }: { readonly compact?: boolean }) {
  return (
    <a
      href="#top"
      className="group flex items-center gap-2.5"
      aria-label="Yukino Sentry home"
    >
      <span className="from-brand-400 via-brand-500 to-accent-500 shadow-brand-500/30 relative grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6">
        <span className="absolute inset-0 rounded-xl bg-linear-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Icon
          name="bug"
          className="relative size-4.5 text-white"
          strokeWidth={2.5}
        />
      </span>
      {!compact ? (
        <span className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
          Yukino{" "}
          <span className="text-brand-500 dark:text-brand-300">Sentry</span>
        </span>
      ) : null}
    </a>
  );
}
