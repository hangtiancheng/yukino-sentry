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

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#analytics" },
  { label: "Performance", href: "#performance" },
  { label: "Plugins", href: "#plugins" },
  { label: "Frameworks", href: "#frameworks" },
  { label: "API", href: "#api" },
] as const;

const GITHUB_URL = "https://github.com/hangtiancheng/yukino-sentry";

@customElement("site-navbar")
export class NavbarElement extends LitElement {
  @state() private scrolled = false;
  @state() private open = false;
  @state() private theme: Theme = themeStore.theme;

  private menuRef = createRef<HTMLDivElement>();
  private iconRef = createRef<HTMLSpanElement>();
  private unsubscribeTheme?: () => void;
  private desktopMedia = window.matchMedia("(min-width: 1280px)");

  private handleScroll = () => {
    this.scrolled = window.scrollY > 12;
  };

  // Rotating a phone/tablet into the desktop range hides the mobile menu, but
  // the body scroll-lock would otherwise stay on and freeze the page.
  private handleDesktopChange = () => {
    if (this.desktopMedia.matches) {
      this.closeMenu();
    }
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
    this.desktopMedia.addEventListener("change", this.handleDesktopChange);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("scroll", this.handleScroll);
    this.desktopMedia.removeEventListener("change", this.handleDesktopChange);
    this.unsubscribeTheme?.();
    document.body.style.overflow = "";
  }

  protected override firstUpdated(): void {
    // Collapse the mobile menu without a styleMap binding, so later
    // renders never clobber the inline styles motion writes.
    const menu = this.menuRef.value;
    if (menu) {
      menu.style.height = "0px";
      menu.style.opacity = "0";
    }
  }

  protected override updated(
    changed: Map<string | number | symbol, unknown>,
  ): void {
    // Rotate/scale the new icon in whenever the theme flips (skip first render).
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

  protected override render() {
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
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => {
                  handleAnchorClick(event, link.href);
                }}
                className={`hover:text-brand-600 dark:hover:text-brand-200 rounded-lg px-3 py-2 text-sm font-semibold ${muted} transition hover:bg-slate-900/5 dark:hover:bg-white/5`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
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
              href="#quickstart"
              onClick={(event) => {
                handleAnchorClick(event, "#quickstart");
              }}
              className={`group ${primaryButton} hidden px-4 py-2 sm:inline-flex`}
            >
              Get started
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
          className={`overflow-hidden border-t ${line} dark:bg-ink-950 bg-white xl:hidden`}
        >
          <div className="space-y-1 px-5 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => {
                  handleAnchorClick(event, link.href);
                  this.closeMenu();
                }}
                className="hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-200 block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition dark:text-slate-200"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="#quickstart"
                onClick={(event) => {
                  handleAnchorClick(event, "#quickstart");
                  this.closeMenu();
                }}
                className={`${brandGradient} inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white`}
              >
                Get started
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
          </div>
        </div>
      </header>
    );
  }
}
