import { LitElement, customElement, state } from "@yukino.js/lit-jsx";
import { animate } from "motion";
import { cn } from "@/lib/cn";
import { EVENT_BARS, SCENES, VITALS, VERSION } from "@/lib/data";
import type { RowTone } from "@/lib/data";
import { LocaleController, t } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n";
import { EASE, reducedMotion, sleep } from "@/lib/motion";
import { Icon } from "@/components/icons/icon";
import {
  container,
  gradientText,
  gridPattern,
  heading,
  line,
  muted,
} from "@/lib/styles";
import { Section } from "@/components/ui/section";

const TABS = [
  { id: "console", icon: "terminal" },
  { id: "dashboard", icon: "activity" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_LABEL_KEY: Record<TabId, MessageKey> = {
  console: "showcase.tabConsole",
  dashboard: "showcase.tabDashboard",
};

const TONE_ROW: Record<RowTone, string> = {
  err: "text-accent-600 dark:text-accent-400",
  warn: "text-g-yellow-600 dark:text-g-yellow-400",
  ok: "text-g-green-600 dark:text-g-green-400",
  info: "text-brand-600 dark:text-brand-400",
};

const TONE_TILE: Record<RowTone, string> = {
  err: "bg-accent-500/12 text-accent-600 dark:bg-accent-400/12 dark:text-accent-400",
  warn: "bg-g-yellow-400/15 text-g-yellow-600 dark:bg-g-yellow-400/10 dark:text-g-yellow-300",
  ok: "bg-g-green-500/12 text-g-green-600 dark:bg-g-green-400/12 dark:text-g-green-300",
  info: "bg-brand-500/12 text-brand-600 dark:bg-brand-400/12 dark:text-brand-300",
};

declare global {
  interface HTMLElementTagNameMap {
    "site-showcase": ShowcaseElement;
  }
}

@customElement("site-showcase")
export class ShowcaseElement extends LitElement {
  @state() private tab: TabId = "console";
  @state() private sceneIndex = 0;
  @state() private visible: number = SCENES[0]!.rows.length;
  @state() private liveRow: number | null = null;
  @state() private typing: string | null = null;

  private generation = 0;
  private swapping = false;
  private looping = false;
  private started = false;
  private visibility?: IntersectionObserver;

  locale = new LocaleController(this);

  override createRenderRoot(): HTMLElement {
    return this;
  }

  override firstUpdated(): void {
    this.positionPill();
    this.visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const first = !this.started;
          this.started = true;
          void this.startLoop(first);
        } else {
          this.stopLoop();
        }
      },
      { threshold: 0.15 },
    );
    this.visibility.observe(this);
  }

  override updated(): void {
    this.positionPill();
    const scroller = this.querySelector<HTMLElement>("[data-console-scroll]");
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.generation++;
    this.looping = false;
    this.visibility?.disconnect();
  }

  private async startLoop(first: boolean): Promise<void> {
    if (this.looping || reducedMotion()) return;
    this.looping = true;
    const generation = this.generation;
    const hold = first ? 3600 : 300;
    await sleep(hold);
    if (generation !== this.generation || !this.looping) return;
    void this.runScene(generation);
  }

  private stopLoop(): void {
    if (!this.started) return;
    this.looping = false;
    this.generation++;
    this.typing = null;
    this.liveRow = null;
    this.visible = SCENES[this.sceneIndex]?.rows.length ?? 0;
  }

  private selectScene(index: number): void {
    this.sceneIndex = index;
    void this.runScene(++this.generation);
  }

  private async runScene(generation: number): Promise<void> {
    const scene = SCENES[this.sceneIndex]!;
    const prompt = t(`showcase.scenes.${scene.id}.prompt` as MessageKey);
    if (reducedMotion()) {
      this.typing = null;
      this.visible = scene.rows.length;
      this.liveRow = null;
      return;
    }
    this.visible = 0;
    this.liveRow = null;
    this.typing = "";
    await sleep(320);
    if (generation !== this.generation) return;

    for (let i = 1; i <= prompt.length; i++) {
      this.typing = prompt.slice(0, i);
      await sleep(28);
      if (generation !== this.generation) return;
    }
    this.typing = null;
    await sleep(420);
    if (generation !== this.generation) return;

    for (let index = 0; index < scene.rows.length; index++) {
      this.visible = index + 1;
      this.liveRow = index;
      await this.updateComplete;
      if (generation !== this.generation) return;
      this.animateLastRow();
      await sleep(scene.rows[index]!.wait);
      if (generation !== this.generation) return;
      this.liveRow = null;
      await sleep(220);
      if (generation !== this.generation) return;
    }

    await sleep(4200);
    if (generation !== this.generation) return;
    this.selectScene((this.sceneIndex + 1) % SCENES.length);
  }

  private animateLastRow(): void {
    if (reducedMotion()) return;
    const rows = this.querySelectorAll<HTMLElement>("[data-step-row]");
    const row = rows[rows.length - 1];
    if (row) {
      animate(
        row,
        { opacity: [0, 1], y: [8, 0] },
        { duration: 0.4, ease: EASE },
      );
    }
  }

  private positionPill(): void {
    const list = this.querySelector<HTMLElement>("[data-tab-list]");
    const pill = this.querySelector<HTMLElement>("[data-tab-pill]");
    const activeButton = list?.querySelector<HTMLElement>(
      `[data-tab="${this.tab}"]`,
    );
    if (!list || !pill || !activeButton) return;
    pill.style.left = `${activeButton.offsetLeft}px`;
    pill.style.width = `${activeButton.offsetWidth}px`;
  }

  private async selectTab(id: TabId): Promise<void> {
    if (id === this.tab || this.swapping) return;
    this.swapping = true;
    const panel = this.querySelector<HTMLElement>("[data-tab-panel]");
    if (panel) {
      await animate(
        panel,
        { opacity: 0, y: -12 },
        { duration: 0.2, ease: EASE },
      ).finished;
    }
    this.tab = id;
    await this.updateComplete;
    this.positionPill();
    const next = this.querySelector<HTMLElement>("[data-tab-panel]");
    if (next && !reducedMotion()) {
      next.style.opacity = "0";
      animate(
        next,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.35, ease: EASE },
      );
    }
    this.swapping = false;
  }

  private renderStepIcon(tone: RowTone, live: boolean) {
    return (
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-md",
          TONE_TILE[tone],
        )}
      >
        {live ? (
          <Icon name="loader-circle" className="size-3 animate-spin" />
        ) : (
          <Icon name="check" className="size-3" />
        )}
      </span>
    );
  }

  private renderConsolePanel() {
    const scene = SCENES[this.sceneIndex]!;
    const prompt = t(`showcase.scenes.${scene.id}.prompt` as MessageKey);
    return (
      <div className="shadow-card overflow-hidden rounded-2xl border border-[#dadce0] bg-white dark:bg-[#1e1f20] dark:shadow-none">
        <div
          className={cn(
            "bg-brand-50/70 flex items-center gap-3 border-b px-4 py-3 dark:bg-white/2",
            line,
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="bg-brand-500 size-3 rounded-full" />
            <span className="bg-accent-500 size-3 rounded-full" />
            <span className="bg-g-yellow-400 size-3 rounded-full" />
          </div>
          <div className="flex flex-1 items-center justify-center gap-2 font-mono text-[11px] text-[#80868b] dark:text-[#9aa0a6]">
            <Icon name="terminal" className="size-3" />
            yukino · {t("showcase.statusSession")}
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            {SCENES.map((_, index) => (
              <button
                type="button"
                aria-label={String(index + 1)}
                onClick={() => this.selectScene(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === this.sceneIndex
                    ? "bg-brand-500 w-5"
                    : "w-1.5 bg-[#dadce0] hover:bg-[#80868b] dark:bg-white/15 dark:hover:bg-white/30",
                )}
              />
            ))}
          </div>
        </div>

        <div
          data-console-scroll
          className="h-84 overflow-hidden px-4 py-5 font-mono text-[12.5px] leading-relaxed sm:h-92 sm:px-5 sm:text-[13px]"
        >
          <div className="mb-4 flex items-center gap-2 text-[11px] text-[#80868b] dark:text-[#9aa0a6]">
            <span className="bg-brand-500/10 inline-flex h-4 items-center rounded px-1.5 text-[#5f6368] dark:bg-white/6 dark:text-[#9aa0a6]">
              @yukino.js/sentry
            </span>
            <span>v{VERSION}</span>
            <span>·</span>
            <span className="text-g-green-600 dark:text-g-green-400">
              ● {t("showcase.statusLive")}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-brand-500 dark:text-brand-400 pt-0.5 select-none">
              ›
            </span>
            <span className="text-[#202124] dark:text-[#e8eaed]">
              {this.typing !== null ? this.typing : prompt}
              {this.typing !== null ? (
                <span className="animate-blink bg-brand-500 dark:bg-brand-400 ml-0.5 inline-block h-[1.05em] w-1.75 translate-y-0.5" />
              ) : null}
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {scene.rows.slice(0, this.visible).map((row, index) => (
              <div
                data-step-row
                className="flex items-center gap-2.5 pl-5 font-mono text-[12.5px] sm:text-[13px]"
              >
                {this.renderStepIcon(row.tone, this.liveRow === index)}
                <Icon
                  name={row.icon}
                  className="size-3.5 shrink-0 text-[#80868b] dark:text-[#9aa0a6]"
                />
                <span className={cn("font-semibold", TONE_ROW[row.tone])}>
                  {row.name}
                </span>
                <span className="truncate text-[#80868b] dark:text-[#9aa0a6]">
                  {row.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "bg-brand-50/70 flex items-center justify-between gap-3 border-t px-4 py-2.5 font-mono text-[11px] text-[#80868b] dark:bg-white/2 dark:text-[#9aa0a6]",
            line,
          )}
        >
          <span className="text-g-green-600 dark:text-g-green-400 inline-flex items-center gap-1.5">
            <span className="bg-g-green-500 size-1.5 rounded-full" />
            {t("showcase.statusLive")}
          </span>
          <span>
            {String(this.sceneIndex + 1).padStart(2, "0")} /{" "}
            {String(SCENES.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  }

  private renderDashboardPanel() {
    const max = Math.max(...EVENT_BARS);
    return (
      <div className="shadow-card overflow-hidden rounded-2xl border border-[#dadce0] bg-white dark:bg-[#1e1f20] dark:shadow-none">
        <div
          className={cn(
            "bg-brand-50/70 flex items-center gap-3 border-b px-4 py-3 dark:bg-white/2",
            line,
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="bg-brand-500 size-3 rounded-full" />
            <span className="bg-accent-500 size-3 rounded-full" />
            <span className="bg-g-yellow-400 size-3 rounded-full" />
          </div>
          <div className="flex flex-1 items-center justify-center gap-2 font-mono text-[11px] text-[#80868b] dark:text-[#9aa0a6]">
            <Icon name="activity" className="size-3" />
            dashboard · {t("showcase.statusSession")}
          </div>
          <span className="bg-g-green-500 size-1.5 rounded-full" />
        </div>

        <div className="space-y-7 px-5 py-6 sm:px-7">
          <div>
            <p
              className={`text-xs font-semibold tracking-[0.14em] uppercase ${muted}`}
            >
              {t("showcase.vitalsTitle")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {VITALS.map((vital) => (
                <div
                  key={vital.name}
                  className={cn(
                    "rounded-xl border px-3.5 py-3",
                    line,
                    "bg-[#f8f9fa] dark:bg-white/2",
                  )}
                >
                  <p className="font-mono text-[11px] text-[#80868b] dark:text-[#9aa0a6]">
                    {vital.name}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xl font-semibold tracking-tight",
                      vital.tone === "good"
                        ? "text-g-green-600 dark:text-g-green-300"
                        : "text-g-yellow-600 dark:text-g-yellow-300",
                    )}
                  >
                    {vital.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#80868b] dark:text-[#9aa0a6]">
                    {vital.tone === "good"
                      ? t("showcase.vitalsGood")
                      : t("showcase.vitalsWatch")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p
                className={`text-xs font-semibold tracking-[0.14em] uppercase ${muted}`}
              >
                {t("showcase.eventsTitle")}
              </p>
              <p className="font-mono text-[11px] text-[#80868b] dark:text-[#9aa0a6]">
                {t("showcase.eventsUnit")}
              </p>
            </div>
            <div className="mt-3 flex h-24 items-end gap-1.5 sm:gap-2.5">
              {EVENT_BARS.map((value, index) => (
                <div
                  key={index}
                  style={{ height: `${Math.round((value / max) * 100)}%` }}
                  className={cn(
                    "flex-1 rounded-t-md transition-colors",
                    index === EVENT_BARS.length - 1
                      ? "bg-brand-600 dark:bg-brand-400"
                      : "bg-brand-500/45 dark:bg-brand-400/35",
                  )}
                />
              ))}
            </div>
          </div>

          <div>
            <p
              className={`text-xs font-semibold tracking-[0.14em] uppercase ${muted}`}
            >
              {t("showcase.errorsTitle")}
            </p>
            <div className="mt-3 space-y-2">
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border bg-[#f8f9fa] px-3.5 py-2.5 dark:bg-white/2",
                  line,
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md",
                    TONE_TILE.err,
                  )}
                >
                  <Icon name="triangle-alert" className="size-3" />
                </span>
                <span className="truncate font-mono text-xs text-[#202124] dark:text-[#e8eaed]">
                  TypeError: cart is undefined
                </span>
                <span className="ml-auto shrink-0 font-mono text-[11px] text-[#80868b] dark:text-[#9aa0a6]">
                  {t("showcase.error1Meta")}
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border bg-[#f8f9fa] px-3.5 py-2.5 dark:bg-white/2",
                  line,
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md",
                    TONE_TILE.err,
                  )}
                >
                  <Icon name="triangle-alert" className="size-3" />
                </span>
                <span className="truncate font-mono text-xs text-[#202124] dark:text-[#e8eaed]">
                  Failed to fetch
                </span>
                <span className="ml-auto shrink-0 font-mono text-[11px] text-[#80868b] dark:text-[#9aa0a6]">
                  {t("showcase.error2Meta")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  override render() {
    return (
      <Section
        id="showcase"
        className="overflow-hidden bg-[#f8f9fa] dark:bg-white/2"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div
            className={cn(
              "absolute inset-0",
              gridPattern,
              "mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)] [-webkit-mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]",
            )}
          />
        </div>

        <div className={`${container} text-center`}>
          <ui-reveal>
            <span className="border-brand-500/25 bg-brand-50 text-brand-700 dark:border-brand-300/15 dark:text-brand-200 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide dark:bg-white/3">
              {t("showcase.eyebrow")}
            </span>
          </ui-reveal>
          <ui-reveal delay={0.05}>
            <h2
              className={`mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl md:text-[2.6rem] md:leading-[1.1] ${heading}`}
            >
              {t("showcase.titleA")}{" "}
              <span className={gradientText}>
                {t("showcase.titleHighlight")}
              </span>
            </h2>
          </ui-reveal>
          <ui-reveal delay={0.1}>
            <p
              className={`mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg ${muted}`}
            >
              {t("showcase.description")}
            </p>
          </ui-reveal>
        </div>

        <ui-reveal delay={0.1} className={cn(container, "relative mt-12")}>
          <div className="mb-6 flex justify-center">
            <div className="max-w-full overflow-x-auto">
              <div
                data-tab-list
                className={cn(
                  "relative inline-flex items-center gap-1 rounded-full border bg-white/70 p-1 backdrop-blur dark:bg-white/3",
                  line,
                )}
                role="tablist"
              >
                <span
                  data-tab-pill
                  className="bg-brand-500/12 absolute top-1 bottom-1 rounded-full transition-all duration-300 dark:bg-white/8"
                  aria-hidden="true"
                />
                {TABS.map((item) => {
                  const selected = item.id === this.tab;
                  return (
                    <button
                      type="button"
                      data-tab={item.id}
                      role="tab"
                      aria-selected={selected}
                      onClick={() => void this.selectTab(item.id)}
                      className={cn(
                        "relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                        selected
                          ? heading
                          : "text-[#5f6368] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed]",
                      )}
                    >
                      <Icon name={item.icon} className="relative size-3.5" />
                      <span className="relative">
                        {t(TAB_LABEL_KEY[item.id])}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div data-tab-panel role="tabpanel" className="mx-auto max-w-3xl">
            {this.tab === "console"
              ? this.renderConsolePanel()
              : this.renderDashboardPanel()}
          </div>

          <p className={cn("mt-4 text-center text-xs", muted)}>
            {t("showcase.caption")}
          </p>
        </ui-reveal>
      </Section>
    );
  }
}
