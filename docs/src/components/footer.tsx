import { GithubIcon } from "./icons/github-icon";
import { Icon } from "./icons/icon";
import { Logo } from "./logo";
import { t } from "@/lib/i18n";
import { handleAnchorClick } from "@/lib/scroll";
import { REPO_URL, VERSION } from "@/lib/data";
import {
  container,
  faint,
  heading,
  iconButton,
  line,
  muted,
} from "@/lib/styles";

function productLinks() {
  return [
    { label: t("footer.linkShowcase"), href: "#showcase" },
    { label: t("footer.linkFeatures"), href: "#features" },
    { label: t("footer.linkInstall"), href: "#install" },
    { label: t("footer.linkFaq"), href: "#faq" },
  ] as const;
}

function externalLinks() {
  return [
    { label: "GitHub", href: REPO_URL },
    {
      label: t("footer.externalNpm"),
      href: "https://www.npmjs.com/package/@yukino.js/sentry",
    },
    { label: t("footer.externalIssues"), href: `${REPO_URL}/issues` },
    {
      label: t("footer.externalLicense"),
      href: `${REPO_URL}/blob/main/LICENSE`,
    },
  ] as const;
}

export function Footer() {
  return (
    <footer className={`dark:bg-ink-950 border-t bg-[#f8f9fa] ${line}`}>
      <div className={`${container} py-16`}>
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className={`mt-4 max-w-xs text-sm leading-relaxed ${muted}`}>
              {t("footer.description")}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
                className={`${iconButton} grid size-9`}
              >
                <GithubIcon className="size-4.5" />
              </a>
              <span
                className={`rounded-full border bg-white px-3 py-1 font-mono text-xs font-semibold dark:bg-white/5 ${line} ${faint}`}
              >
                v{VERSION}
              </span>
            </div>
          </div>

          <nav>
            <h3
              className={`text-xs font-bold tracking-[0.14em] uppercase ${heading}`}
            >
              {t("footer.productTitle")}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {productLinks().map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(event) => handleAnchorClick(event, link.href)}
                    className={`hover:text-brand-600 dark:hover:text-brand-200 inline-block py-1.5 text-sm ${muted} transition`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h3
              className={`text-xs font-bold tracking-[0.14em] uppercase ${heading}`}
            >
              {t("footer.resourcesTitle")}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {externalLinks().map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`group hover:text-brand-600 dark:hover:text-brand-200 inline-flex items-center gap-1 py-1.5 text-sm ${muted} transition`}
                  >
                    {link.label}
                    <Icon
                      name="arrow-up-right"
                      className="size-3.5 opacity-0 transition group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          className={`mt-14 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row ${line}`}
        >
          <p className={`text-xs ${faint}`}>
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p className={`text-xs ${faint}`}>{t("footer.tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
