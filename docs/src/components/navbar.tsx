import {
  createRef,
  LitElement,
  customElement,
  state,
} from "@yukino.js/lit-jsx";
import { animate } from "motion";

import { GithubIcon } from "./icons/github-icon";
import { Icon } from "./icons/icon";
import { Logo } from "./logo";
import {
  getLocale,
  type Locale,
  LocaleController,
  LOCALES,
  LOCALE_LABELS,
  setLocale,
  t,
} from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { handleAnchorClick } from "@/lib/scroll";
import {
  brandGradient,
  container,
  glass,
  iconButton,
  line,
  muted,
  primaryButton,
} from "@/lib/styles";
import { themeStore, type Theme } from "@/lib/theme";

declare global {
  interface HTMLElementTagNameMap {
    "site-navbar": NavbarElement;
  }
}

type LocaleTarget = "desktop" | "mobile" | "closed";

const GITHUB_URL = "https://github.com/hangtiancheng/yukino-sentry";

@customElement("site-navbar")
export class NavbarElement extends LitElement {
  @state() private scrolled = false;
  @state() private open = false;
  @state() private theme: Theme = themeStore.theme;
  @state() private localeMenu: LocaleTarget = "closed";

  locale = new LocaleController(this);

  private menuRef = createRef<HTMLDivElement>();
  private iconRef = createRef<HTMLSpanElement>();
  private unsubscribeTheme?: () => void;
  private desktopMedia = window.matchMedia("(min-width: 1280px)");
  private localeClosing = false;

  private handleScroll = () => {
    this.scrolled = window.scrollY > 12;
    if (this.localeMenu !== "closed") void this.closeLocaleMenu();
  };

  private handleDesktopChange = () => {
    if (this.desktopMedia.matches) {
      this.closeMenu();
    }
  };

  private onDocPointerDown = (event: PointerEvent) => {
    if (this.localeMenu === "closed") return;
    const target = event.target as Element | null;
    if (target?.closest("[data-locale-root]")) return;
    void this.closeLocaleMenu();
  };

  private onDocKeyDown = (event: KeyboardEvent) => {
    if (this.localeMenu === "closed" || event.key !== "Escape") return;
    const which = this.localeMenu;
    void this.closeLocaleMenu().then(() => this.focusLocaleTrigger(which));
  };

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.unsubscribeTheme = themeStore.subscribe((theme) => {
      this.theme = theme;
    });
    this.handleScroll();
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    document.addEventListener("pointerdown", this.onDocPointerDown);
    document.addEventListener("keydown", this.onDocKeyDown);
    this.desktopMedia.addEventListener("change", this.handleDesktopChange);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("pointerdown", this.onDocPointerDown);
    document.removeEventListener("keydown", this.onDocKeyDown);
    this.desktopMedia.removeEventListener("change", this.handleDesktopChange);
    this.unsubscribeTheme?.();
    document.body.style.overflow = "";
  }

  protected override firstUpdated(): void {
    const menu = this.menuRef.value;
    if (menu) {
      menu.style.height = "0px";
      menu.style.opacity = "0";
    }
  }

  protected override updated(
    changed: Map<string | number | symbol, unknown>,
  ): void {
    if (changed.get("theme") !== undefined && this.iconRef.value) {
      animate(
        this.iconRef.value,
        { opacity: [0, 1], rotate: [-90, 0], scale: [0.5, 1] },
        { duration: 0.22 },
      );
    }
  }

  private toggleMenu(): void {
    this.open = !this.open;
    document.body.style.overflow = this.open ? "hidden" : "";
    const menu = this.menuRef.value;
    if (menu) {
      animate(
        menu,
        { height: this.open ? "auto" : 0, opacity: this.open ? 1 : 0 },
        { duration: 0.28, ease: EASE },
      );
    }
  }

  private closeMenu(): void {
    if (this.open) {
      this.toggleMenu();
    }
  }

  private async toggleLocaleMenu(which: "desktop" | "mobile") {
    if (this.localeMenu === which) {
      await this.closeLocaleMenu();
      this.focusLocaleTrigger(which);
      return;
    }
    this.localeMenu = which;
    await this.updateComplete;
    const popup = this.querySelector<HTMLElement>("[data-locale-popup]");
    if (popup) {
      animate(
        popup,
        { opacity: [0, 1], y: [-6, 0], scale: [0.96, 1] },
        { duration: 0.18, ease: EASE },
      );
      popup.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    }
  }

  private async closeLocaleMenu() {
    const which = this.localeMenu;
    if (which === "closed" || this.localeClosing) return;
    this.localeClosing = true;
    const popup = this.querySelector<HTMLElement>("[data-locale-popup]");
    try {
      if (popup) {
        await animate(
          popup,
          { opacity: 0, y: -6, scale: 0.96 },
          { duration: 0.15, ease: EASE },
        ).finished;
      }
    } catch {
      this.localeClosing = false;
      return;
    }
    this.localeClosing = false;
    if (this.localeMenu === which) this.localeMenu = "closed";
  }

  private focusLocaleTrigger(which: "desktop" | "mobile") {
    this.querySelector<HTMLElement>(
      `[data-locale-trigger="${which}"]`,
    )?.focus();
  }

  private selectLocale(locale: Locale, which: "desktop" | "mobile") {
    setLocale(locale);
    void this.closeLocaleMenu().then(() => this.focusLocaleTrigger(which));
  }

  private onLocalePopupKeyDown(event: KeyboardEvent) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const popup = event.currentTarget as HTMLElement;
    const options = Array.from(
      popup.querySelectorAll<HTMLElement>("[role='menuitemradio']"),
    );
    if (options.length === 0) return;
    const index = options.indexOf(document.activeElement as HTMLElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    options[(index + delta + options.length) % options.length]?.focus();
  }

  private navLinks() {
    return [
      { label: t("nav.showcase"), href: "#showcase" },
      { label: t("nav.features"), href: "#features" },
      { label: t("nav.install"), href: "#install" },
      { label: t("nav.faq"), href: "#faq" },
    ] as const;
  }

  private renderLocaleSwitcher(mobile: boolean) {
    const active = getLocale();
    const which = mobile ? "mobile" : "desktop";
    const open = this.localeMenu === which;
    return (
      <div data-locale-root="" className={`relative ${mobile ? "w-full" : ""}`}>
        <button
          type="button"
          data-locale-trigger={which}
          onClick={() => void this.toggleLocaleMenu(which)}
          onKeydown={(event) => {
            if (
              !open &&
              (event.key === "ArrowDown" || event.key === "ArrowUp")
            ) {
              event.preventDefault();
              void this.toggleLocaleMenu(which);
            }
          }}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={`locale-menu-${which}`}
          aria-label={t("common.language")}
          className={`flex items-center gap-1.5 rounded-full border py-2 text-xs font-semibold transition ${line} ${iconButton} ${mobile ? "w-full justify-between px-4" : "pr-2.5 pl-3"}`}
        >
          <span className="flex items-center gap-2">
            <Icon name="globe" className="size-4 opacity-60" />
            {LOCALE_LABELS[active]}
          </span>
          <Icon
            name="chevron-down"
            className={`size-3.5 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open ? (
          <div
            id={`locale-menu-${which}`}
            data-locale-popup=""
            role="menu"
            aria-label={t("common.language")}
            onKeydown={(event) => this.onLocalePopupKeyDown(event)}
            className={`shadow-raised dark:bg-ink-800 absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-white p-1.5 ${line} ${mobile ? "inset-x-0" : "right-0 min-w-40"}`}
          >
            {LOCALES.map((locale) => {
              const selected = locale === active;
              return (
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => this.selectLocale(locale, which)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
                    selected
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                      : "text-[#3c4043] hover:bg-black/4 dark:text-[#e8eaed] dark:hover:bg-white/6"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`size-2 rounded-full ${selected ? "bg-brand-500" : "bg-transparent"}`}
                    />
                    {LOCALE_LABELS[locale]}
                  </span>
                  {selected ? (
                    <Icon
                      name="check"
                      className="text-brand-600 dark:text-brand-300 size-4"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  protected override render() {
    const links = this.navLinks();
    return (
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          this.scrolled
            ? `border-b ${line} ${glass}`
            : "border-b border-transparent"
        }`}
      >
        <nav className={`${container} flex h-16 items-center gap-3`}>
          <Logo />

          <div className="ml-6 hidden items-center gap-1 xl:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => {
                  handleAnchorClick(event, link.href);
                }}
                className={`hover:text-brand-600 dark:hover:text-brand-200 rounded-full px-3.5 py-2 text-sm font-medium ${muted} hover:bg-brand-50 transition dark:hover:bg-white/5`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden xl:block">
              {this.renderLocaleSwitcher(false)}
            </div>

            <button
              type="button"
              onClick={() => themeStore.toggle()}
              aria-label="Toggle color theme"
              className={`${iconButton} relative grid size-10 overflow-hidden`}
            >
              <span ref={this.iconRef} className="grid place-items-center">
                <Icon
                  name={this.theme === "dark" ? "moon" : "sun"}
                  className="size-4.5"
                />
              </span>
            </button>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className={`${iconButton} hidden size-10 sm:grid`}
            >
              <GithubIcon className="size-4.5" />
            </a>

            <a
              href="#install"
              onClick={(event) => {
                handleAnchorClick(event, "#install");
              }}
              className={`group ${primaryButton} hidden px-5 py-2.5 sm:inline-flex`}
            >
              {t("nav.getStarted")}
              <Icon
                name="arrow-right"
                className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              />
            </a>

            <button
              type="button"
              onClick={() => this.toggleMenu()}
              aria-label="Toggle navigation menu"
              className={`${iconButton} grid size-10 xl:hidden`}
            >
              <Icon name={this.open ? "x" : "menu"} className="size-5" />
            </button>
          </div>
        </nav>

        <div
          ref={this.menuRef}
          aria-hidden={!this.open ? "true" : undefined}
          inert={!this.open}
          className={`dark:bg-ink-950 overflow-hidden border-t bg-white xl:hidden ${line}`}
        >
          <div className="space-y-1 px-5 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => {
                  handleAnchorClick(event, link.href);
                  this.closeMenu();
                }}
                className="hover:bg-brand-50 hover:text-brand-600 dark:hover:text-brand-200 block rounded-xl px-3 py-2.5 text-sm font-medium text-[#3c4043] transition dark:text-[#e8eaed] dark:hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="#install"
                onClick={(event) => {
                  handleAnchorClick(event, "#install");
                  this.closeMenu();
                }}
                className={`${brandGradient} inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white`}
              >
                {t("nav.getStarted")}
                <Icon name="arrow-right" className="size-4" />
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
                className={`${iconButton} grid size-10`}
              >
                <GithubIcon className="size-5" />
              </a>
            </div>
            <div className="pt-3">{this.renderLocaleSwitcher(true)}</div>
          </div>
        </div>
      </header>
    );
  }
}
