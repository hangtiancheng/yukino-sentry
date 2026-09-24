import { Icon } from "@/components/icons/icon";
import { Pill } from "@/components/ui/pill";
import { Section } from "@/components/ui/section";
import { t } from "@/lib/i18n";
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
  readonly id: "tool1" | "tool2";
  readonly icon: string;
  readonly name: string;
  readonly code: string;
  readonly filename: string;
}

const DEV_TOOLS: readonly DevTool[] = [
  {
    id: "tool1",
    icon: "server",
    name: "Vite dev server",
    code: VITE_CODE,
    filename: "vite.config.ts",
  },
  {
    id: "tool2",
    icon: "terminal",
    name: "webpack-dev-server",
    code: WEBPACK_CODE,
    filename: "webpack.config.mjs",
  },
];

export function Integrations() {
  return (
    <Section
      id="integrations"
      eyebrow={t("integrations.eyebrow")}
      title={t("integrations.title")}
      accent={t("integrations.accent")}
      description={t("integrations.description")}
    >
      <ui-reveal-list className="grid gap-5 lg:grid-cols-2">
        {DEV_TOOLS.map((tool) => (
          <ui-reveal-item key={tool.id} className="h-full">
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
                {t(`integrations.${tool.id}Blurb`)}
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
              {t("integrations.sourcemapBadge")}
            </span>
            <h3
              className={`mt-4 text-2xl font-black tracking-tight ${heading}`}
            >
              {t("integrations.sourcemapTitle")}{" "}
              <span className={gradientText}>
                {t("integrations.sourcemapAccent")}
              </span>
            </h3>
            <p className={`mt-4 text-sm leading-relaxed ${muted}`}>
              {t("integrations.sourcemapDescription")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Pill icon="file-code">{t("integrations.pill1")}</Pill>
              <Pill icon="terminal">{t("integrations.pill2")}</Pill>
              <Pill icon="server">{t("integrations.pill3")}</Pill>
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
