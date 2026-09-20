import { Icon } from "@/components/icons/icon";
import { Pill } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
import { VITE_CODE, WEBPACK_CODE } from "./snippets";
import {
  card,
  gradientText,
  heading,
  iconTile,
  iconTileSoft,
  muted,
} from "@/lib/styles";

const RESOLVED_FRAME = `TypeError: total is undefined
  at calculateTotal (src/cart.ts:42:18)   // ← original source
    40 |   const items = cart.lineItems;
    41 |   const total = items.reduce((sum, item) => sum + item.price, 0);
  > 42 |   return total.toFixed(2);
       |                ^
    43 | }`;

interface DevTool {
  readonly icon: string;
  readonly name: string;
  readonly blurb: string;
  readonly code: string;
  readonly filename: string;
}

const DEV_TOOLS: readonly DevTool[] = [
  {
    icon: "server",
    name: "Vite dev server",
    blurb:
      "Intercepts the mock endpoint, writes timestamped JSONL logs and resolves stacks from the in-memory module graph.",
    code: VITE_CODE,
    filename: "vite.config.ts",
  },
  {
    icon: "terminal",
    name: "webpack-dev-server",
    blurb:
      "Collects emitted .map assets with assetEmitted and enriches error records before writing them to disk.",
    code: WEBPACK_CODE,
    filename: "webpack.config.mjs",
  },
];

export function Integrations() {
  return (
    <Section
      id="integrations"
      eyebrow="Developer tooling"
      title="Readable stacks"
      accent="during development."
      description="Both dev-server plugins mock your report endpoint so nothing hits production, then map bundled positions back to the original source with inline snippets."
    >
      <ui-reveal-list className="grid gap-5 lg:grid-cols-2">
        {DEV_TOOLS.map((tool) => (
          <ui-reveal-item key={tool.name} className="h-full">
            <div className={`${card} flex h-full flex-col rounded-3xl p-6`}>
              <div className="mb-5 flex items-center gap-3">
                <span
                  className={`${iconTile} grid size-11 shrink-0 place-items-center rounded-xl`}
                >
                  <Icon name={tool.icon} className="size-5" />
                </span>
                <h3 className={`min-w-0 text-lg font-bold ${heading}`}>
                  {tool.name}
                </h3>
              </div>
              <p className={`mb-5 text-sm leading-relaxed ${muted}`}>
                {tool.blurb}
              </p>
              <div className="mt-auto">
                <code-block code={tool.code} filename={tool.filename} />
              </div>
            </div>
          </ui-reveal-item>
        ))}
      </ui-reveal-list>

      <ui-reveal delay={0.1} className="mt-6">
        <div
          className={`${card} grid items-center gap-8 rounded-3xl p-6 sm:p-8 lg:grid-cols-2`}
        >
          <div>
            <span
              className={`${iconTileSoft} inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold`}
            >
              <Icon name="file-code" className="size-3.5" />
              Source map resolution
            </span>
            <h3
              className={`mt-4 text-2xl font-black tracking-tight ${heading}`}
            >
              Minified in the browser.{" "}
              <span className={gradientText}>Readable in your logs.</span>
            </h3>
            <p className={`mt-4 text-sm leading-relaxed ${muted}`}>
              Error, stack-like and framework records are enriched with original
              file, line, column, symbol name and a three-line snippet on each
              side of the failing line. Resolution failures stay silent and
              never corrupt the raw report.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Pill icon="file-code">Code errors</Pill>
              <Pill icon="terminal">Stack strings</Pill>
              <Pill icon="server">React · Vue · Other</Pill>
            </div>
          </div>
          <code-block
            code={RESOLVED_FRAME}
            filename="resolved-frame.log"
            chrome
          />
        </div>
      </ui-reveal>
    </Section>
  );
}
