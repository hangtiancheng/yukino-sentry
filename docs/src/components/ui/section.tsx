import { container, gradientText, heading, muted } from "@/lib/styles";

export interface SectionProps {
  readonly id?: string;
  readonly eyebrow?: string;
  readonly title: unknown;
  readonly accent?: unknown;
  readonly description?: unknown;
  readonly children?: unknown;
  readonly className?: string;
  readonly contentClassName?: string;
}

export function Section({
  id,
  eyebrow,
  title,
  accent,
  description,
  children,
  className,
  contentClassName,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 py-20 sm:py-28 ${className ?? ""}`}
    >
      <div className={container}>
        <ui-reveal className="max-w-3xl">
          {eyebrow ? (
            <p className="text-brand-600 dark:text-brand-300 mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.22em] uppercase">
              <span className="from-brand-500 to-accent-500 h-px w-8 bg-linear-to-r" />
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={`text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-[2.9rem] lg:leading-[1.08] ${heading}`}
          >
            {title}
            {accent ? (
              <>
                {" "}
                <span className={gradientText}>{accent}</span>
              </>
            ) : null}
          </h2>
          {description ? (
            <p className={`mt-5 text-lg leading-relaxed text-pretty ${muted}`}>
              {description}
            </p>
          ) : null}
        </ui-reveal>
        <div className={`mt-12 sm:mt-14 ${contentClassName ?? ""}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
