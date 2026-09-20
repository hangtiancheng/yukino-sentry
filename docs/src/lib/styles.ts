/**
 * Shared Tailwind utility recipes.
 *
 * Everything here is a plain string of Tailwind utilities — there are no custom
 * CSS classes or selectors. Keeping the long class lists in one place keeps the
 * components readable and the visual language consistent without introducing a
 * parallel stylesheet.
 *
 * Recipes never include a `display` utility or padding on buttons, so callers
 * can add `hidden`/`sm:grid`/size overrides without same-property conflicts.
 */

export const page =
  "selection:bg-brand-500/30 selection:text-brand-950 dark:bg-ink-950 dark:selection:bg-brand-400/30 min-h-dvh overflow-x-clip bg-white font-sans text-slate-900 antialiased dark:text-slate-100 dark:selection:text-white";

export const container = "mx-auto w-full max-w-7xl px-5 sm:px-8";

export const heading = "text-slate-900 dark:text-white";
export const muted = "text-slate-600 dark:text-slate-400";
export const faint = "text-slate-500 dark:text-slate-400";

export const line = "border-slate-900/10 dark:border-white/10";

/** Card surface without a radius — callers add rounded-2xl/3xl as needed. */
export const card =
  "shadow-card border border-slate-900/10 bg-white dark:border-white/10 dark:bg-white/3 dark:shadow-none";

export const cardHover =
  "hover:shadow-glow transition duration-300 hover:-translate-y-1 hover:border-brand-400/60 dark:hover:border-brand-400/40 dark:hover:bg-white/5";

export const glass = "bg-white/80 backdrop-blur-xl dark:bg-ink-950/80";

export const gradientText =
  "from-brand-500 via-brand-400 to-accent-500 bg-linear-to-r bg-clip-text text-transparent";

export const brandGradient = "from-brand-500 to-accent-500 bg-linear-to-r";

/** Gradient icon chip; callers add sizing, radius and centering. */
export const iconTile =
  "from-brand-500/15 to-accent-500/15 text-brand-600 ring-brand-500/20 dark:text-brand-300 bg-linear-to-br ring-1";

/** Flat icon chip for denser grids. */
export const iconTileSoft =
  "bg-brand-500/10 text-brand-600 dark:text-brand-300";

export const gridPattern =
  "bg-[linear-gradient(to_right,rgba(120,110,180,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,110,180,0.14)_1px,transparent_1px)] bg-size-[56px_56px] dark:bg-[linear-gradient(to_right,rgba(168,140,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,140,255,0.1)_1px,transparent_1px)]";

/** Subtle full-bleed tint that gives alternating sections their own band. */
export const band = "bg-brand-50/50 dark:bg-white/1.5";

/** Gradient CTA; callers add display and padding so sizes never conflict. */
export const primaryButton =
  "from-brand-500 to-accent-500 shadow-brand-500/30 hover:shadow-brand-500/50 items-center justify-center gap-2 rounded-xl bg-linear-to-r text-sm font-bold text-white shadow-xl transition";

export const secondaryButton =
  "hover:border-brand-400/60 hover:text-brand-600 items-center justify-center gap-2 rounded-xl border border-slate-900/15 bg-white/60 text-sm font-bold text-slate-700 backdrop-blur transition dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:text-brand-200";

/** Square icon button used by the navbar and footer; callers add display+size. */
export const iconButton =
  "hover:border-brand-400/50 hover:text-brand-600 dark:hover:text-brand-200 shrink-0 place-items-center rounded-xl border border-slate-900/10 text-slate-600 transition dark:border-white/10 dark:text-slate-300";
