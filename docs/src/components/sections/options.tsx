import { Section } from "@/components/ui/section";
import { EVENT_TYPES, OPTION_GROUPS } from "@/lib/data";
import {
  band,
  card,
  cardHover,
  faint,
  heading,
  iconTileSoft,
  line,
  muted,
} from "@/lib/styles";

export function Options() {
  return (
    <Section
      id="options"
      eyebrow="Configuration"
      title="Every knob,"
      accent="documented."
      description="init() accepts a partial options object. Anything you omit falls back to a default, and zod validates the merged result before a single listener is installed."
      className={band}
    >
      <div className="space-y-8">
        {OPTION_GROUPS.map((group) => (
          <ui-reveal key={group.title}>
            <div className={`${card} overflow-hidden rounded-3xl`}>
              <div className={`border-b px-6 py-5 ${line}`}>
                <h3 className={`text-lg font-bold ${heading}`}>
                  {group.title}
                </h3>
                <p className={`mt-1 text-sm ${faint}`}>{group.blurb}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-170 border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-900/3 text-xs font-bold tracking-wide text-slate-500 uppercase dark:bg-white/4 dark:text-slate-400">
                      <th className="px-6 py-3">Option</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Default</th>
                      <th className="px-6 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
                      <tr
                        key={row.name}
                        className="hover:bg-brand-500/4 dark:hover:bg-brand-500/6 border-t border-slate-900/5 transition dark:border-white/5"
                      >
                        <td className="text-brand-600 dark:text-brand-300 px-6 py-3.5 align-top font-mono text-xs font-bold whitespace-nowrap">
                          {row.name}
                        </td>
                        <td
                          className={`px-6 py-3.5 align-top font-mono text-xs whitespace-nowrap ${faint}`}
                        >
                          {row.type}
                        </td>
                        <td className="px-6 py-3.5 align-top font-mono text-xs whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {row.value}
                        </td>
                        <td className={`px-6 py-3.5 align-top ${muted}`}>
                          {row.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ui-reveal>
        ))}
      </div>

      <ui-reveal className="mt-16">
        <h3 className={`text-2xl font-black tracking-tight ${heading}`}>
          Event types
        </h3>
        <p className={`mt-2 max-w-2xl text-sm leading-relaxed ${muted}`}>
          Every report carries a typed{" "}
          <span className="font-mono text-[0.85em]">EventType</span> so you can
          route, sample or drop signals downstream without guessing.
        </p>
      </ui-reveal>

      <ui-reveal-list className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EVENT_TYPES.map((event) => (
          <ui-reveal-item key={event.value}>
            <div
              className={`flex items-start gap-3 rounded-2xl p-4 ${card} ${cardHover}`}
            >
              <span
                className={`${iconTileSoft} mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-bold`}
              >
                {event.label.slice(0, 2)}
              </span>
              <div>
                <p className={`font-mono text-sm font-bold ${heading}`}>
                  {event.label}
                </p>
                <p className={`mt-0.5 text-xs leading-relaxed ${faint}`}>
                  {event.description}
                </p>
                <p className="mt-1 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  &quot;{event.value}&quot;
                </p>
              </div>
            </div>
          </ui-reveal-item>
        ))}
      </ui-reveal-list>
    </Section>
  );
}
