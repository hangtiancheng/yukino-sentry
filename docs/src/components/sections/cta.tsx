import { GithubIcon } from "@/components/icons/github-icon";
import { Icon } from "@/components/icons/icon";
import { handleAnchorClick } from "@/lib/scroll";
import {
  gridPattern,
  heading,
  muted,
  primaryButton,
  secondaryButton,
} from "@/lib/styles";

export function CTA() {
  return (
    <section className="scroll-mt-28 px-5 pb-24 sm:px-8">
      <ui-reveal className="mx-auto w-full max-w-7xl">
        <div className="bg-brand-50 border-brand-200/70 dark:bg-ink-950 relative overflow-hidden rounded-4xl border px-6 py-16 text-center sm:px-12 sm:py-20 dark:border-white/10">
          <div className="pointer-events-none absolute inset-0">
            <div className="bg-brand-500/20 dark:bg-brand-500/40 absolute -top-32 left-1/2 h-80 w-160 -translate-x-1/2 rounded-full blur-[120px]" />
            <div className="bg-accent-500/15 dark:bg-accent-500/30 absolute -bottom-24 -left-16 h-64 w-64 rounded-full blur-[110px]" />
            <div className="bg-brand-400/15 dark:bg-brand-400/30 absolute -right-16 -bottom-24 h-64 w-64 rounded-full blur-[110px]" />
            <div
              className={`absolute inset-0 ${gridPattern} mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]`}
            />
          </div>

          <div className="relative">
            <loop-effect
              keyframes={{ y: [0, -6, 0] }}
              duration={4}
              className="border-brand-300/70 text-brand-700 dark:text-brand-200 inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-1.5 text-xs font-bold backdrop-blur dark:border-white/15 dark:bg-white/5"
            >
              <Icon name="sparkles" className="size-3.5" />
              Five lines. Every signal.
            </loop-effect>

            <h2
              className={`mx-auto mt-6 max-w-3xl text-3xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl ${heading}`}
            >
              Start catching what breaks
              <span className="from-brand-600 via-brand-500 to-accent-600 dark:from-brand-300 dark:to-accent-300 block bg-linear-to-r bg-clip-text text-transparent dark:via-white">
                before your users tell you.
              </span>
            </h2>

            <p
              className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty ${muted}`}
            >
              Install the SDK, point it at an endpoint and ship. Yukino Sentry
              handles the classification, batching, retries and session context
              for you.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#quickstart"
                onClick={(event) => handleAnchorClick(event, "#quickstart")}
                className={`group ${primaryButton} dark:text-ink-950 dark:hover:bg-brand-100 inline-flex px-6 py-3.5 dark:bg-white dark:bg-none dark:shadow-black/30`}
              >
                Get started free
                <Icon
                  name="arrow-right"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="https://github.com/hangtiancheng/yukino-sentry"
                target="_blank"
                rel="noreferrer"
                className={`${secondaryButton} inline-flex px-6 py-3.5`}
              >
                <GithubIcon className="size-4" />
                Browse the source
              </a>
            </div>

            <p className="mt-8 font-mono text-xs text-slate-500 dark:text-slate-400">
              <span className="text-brand-600 dark:text-brand-300">$</span> npm
              install @yukino.js/sentry
            </p>
          </div>
        </div>
      </ui-reveal>
    </section>
  );
}
