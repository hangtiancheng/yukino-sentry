import { cn } from "@/lib/cn";
import {
  container,
  eyebrow as eyebrowClass,
  gradientText,
  heading,
  muted,
} from "@/lib/styles";

export interface SectionProps {
  readonly id?: string;
  readonly children?: unknown;
  readonly className?: string;
}

export function Section({ id, children, className }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-20 py-16 sm:py-24", className)}
    >
      {children}
    </section>
  );
}

export interface SectionHeaderProps {
  readonly eyebrow: string;
  readonly titleA: string;
  readonly titleHighlight: string;
  readonly description: string;
  readonly className?: string;
}

export function SectionHeader({
  eyebrow,
  titleA,
  titleHighlight,
  description,
}: SectionHeaderProps) {
  return (
    <div className={cn(container, "text-center")}>
      <div className="mx-auto max-w-3xl">
        <ui-reveal>
          <span className={eyebrowClass}>{eyebrow}</span>
        </ui-reveal>
        <ui-reveal delay={0.05}>
          <h2
            className={cn(
              "mt-5 text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl md:text-[2.6rem] md:leading-[1.1]",
              heading,
            )}
          >
            {titleA} <span className={gradientText}>{titleHighlight}</span>
          </h2>
        </ui-reveal>
        <ui-reveal delay={0.1}>
          <p
            className={cn(
              "mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg",
              muted,
            )}
          >
            {description}
          </p>
        </ui-reveal>
      </div>
    </div>
  );
}
