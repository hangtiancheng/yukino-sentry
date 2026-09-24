import { LitElement, customElement, property, state } from "@yukino.js/lit-jsx";

import { Icon } from "@/components/icons/icon";
import { LocaleController, t } from "@/lib/i18n";

declare global {
  interface HTMLElementTagNameMap {
    "code-block": CodeBlockElement;
  }
}

const KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "default",
  "const",
  "let",
  "var",
  "function",
  "return",
  "new",
  "await",
  "async",
  "if",
  "else",
  "for",
  "of",
  "in",
  "try",
  "catch",
  "finally",
  "throw",
  "typeof",
  "instanceof",
  "void",
  "class",
  "extends",
  "implements",
  "interface",
  "type",
  "readonly",
  "true",
  "false",
  "null",
  "undefined",
  "this",
  "super",
  "as",
  "satisfies",
]);

const TOKEN_PATTERN =
  /(\/\/[^\n]*|#[^\n]*|`[^`]*`|"[^"\n]*"|'[^'\n]*'|\b\d[\d_]*(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;

function classify(token: string, rest: string): string {
  if (token.startsWith("//") || token.startsWith("#")) {
    return "text-[#80868b] dark:text-[#9aa0a6] italic";
  }
  if (/^[`"']/.test(token)) {
    return "text-g-green-600 dark:text-g-green-300";
  }
  if (/^\d/.test(token)) {
    return "text-g-yellow-600 dark:text-g-yellow-300";
  }
  if (KEYWORDS.has(token)) {
    return "text-brand-600 dark:text-brand-300";
  }
  if (/^[A-Z]/.test(token)) {
    return "text-sky-600 dark:text-sky-300";
  }
  if (rest.startsWith("(")) {
    return "text-accent-600 dark:text-accent-300";
  }
  return "text-[#3c4043] dark:text-[#e8eaed]";
}

function highlight(line: string): unknown[] {
  const nodes: unknown[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(line.slice(lastIndex, index));
    }
    const token = match[0];
    const rest = line.slice(index + token.length);
    nodes.push(<span className={classify(token, rest)}>{token}</span>);
    lastIndex = index + token.length;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }
  return nodes;
}

@customElement("code-block")
export class CodeBlockElement extends LitElement {
  @property() code = "";
  @property() filename?: string;
  @property({ type: Boolean }) showLineNumbers = false;
  @property({ type: Boolean }) chrome = true;
  @state() private copied = false;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  locale = new LocaleController(this);

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  private handleCopy(): void {
    void navigator.clipboard?.writeText(this.code).catch(() => undefined);
    this.copied = true;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.copied = false;
    }, 1600);
  }

  protected override render() {
    const lines = this.code.replace(/\n$/, "").split("\n");

    return (
      <div className="shadow-card dark:bg-ink-950 h-full overflow-hidden rounded-2xl border border-[#dadce0] bg-[#f8f9fa] dark:border-white/10 dark:shadow-black/40">
        {this.chrome ? (
          <div className="flex items-center gap-2 border-b border-[#dadce0] bg-[#f1f3f4] px-4 py-3 dark:border-white/10 dark:bg-white/3">
            <span className="size-3 shrink-0 rounded-full bg-[#ea4335]" />
            <span className="size-3 shrink-0 rounded-full bg-[#fbbc04]" />
            <span className="size-3 shrink-0 rounded-full bg-[#34a853]" />
            {this.filename ? (
              <span className="ml-2 truncate font-mono text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                {this.filename}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => this.handleCopy()}
              aria-label={t("common.copy")}
              className="hover:border-brand-400/60 hover:text-brand-700 ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#dadce0] bg-white px-3.5 py-2 text-xs font-medium text-[#3c4043] transition dark:border-white/10 dark:bg-white/5 dark:text-[#9aa0a6] dark:hover:text-white"
            >
              <Icon
                name={this.copied ? "check" : "copy"}
                className={`size-3.5 ${this.copied ? "text-g-green-500 dark:text-g-green-300" : ""}`}
              />
              {this.copied ? t("common.copied") : t("common.copy")}
            </button>
          </div>
        ) : null}
        <pre className="overflow-x-auto p-4 text-[13px] leading-6 sm:p-5">
          <code className="font-mono">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {this.showLineNumbers ? (
                  <span className="text-brand-400/70 mr-4 w-6 shrink-0 text-right select-none dark:text-[#9aa0a6]">
                    {index + 1}
                  </span>
                ) : null}
                <span className="flex-1 whitespace-pre">
                  {line ? highlight(line) : " "}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    );
  }
}
