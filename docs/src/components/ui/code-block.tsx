import { LitElement, customElement, property, state } from "@yukino.js/lit-jsx";

import { Icon } from "@/components/icons/icon";

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
    return "text-slate-400 dark:text-slate-500 italic";
  }
  if (/^[`"']/.test(token)) {
    return "text-emerald-600 dark:text-emerald-300";
  }
  if (/^\d/.test(token)) {
    return "text-amber-600 dark:text-amber-300";
  }
  if (KEYWORDS.has(token)) {
    return "text-brand-600 dark:text-brand-300";
  }
  if (/^[A-Z]/.test(token)) {
    return "text-sky-600 dark:text-sky-300";
  }
  if (rest.startsWith("(")) {
    return "text-orange-600 dark:text-yellow-200";
  }
  return "text-slate-700 dark:text-slate-200";
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
      <div className="bg-brand-50/80 border-brand-200/70 shadow-brand-950/5 ring-brand-900/5 dark:bg-ink-950 dark:shadow-brand-950/40 h-full overflow-hidden rounded-2xl border shadow-2xl ring-1 dark:border-white/10 dark:ring-black/5">
        {this.chrome ? (
          <div className="bg-brand-100/60 border-brand-200/70 flex items-center gap-2 border-b px-4 py-3 dark:border-white/10 dark:bg-white/3">
            <span className="size-3 shrink-0 rounded-full bg-[#ff5f57]" />
            <span className="size-3 shrink-0 rounded-full bg-[#febc2e]" />
            <span className="size-3 shrink-0 rounded-full bg-[#28c840]" />
            {this.filename ? (
              <span className="ml-2 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                {this.filename}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => this.handleCopy()}
              aria-label="Copy code"
              className="border-brand-300/60 hover:border-brand-400/60 hover:text-brand-700 ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 transition dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
            >
              <Icon
                name={this.copied ? "check" : "copy"}
                className={`size-3.5 ${this.copied ? "text-emerald-500 dark:text-emerald-400" : ""}`}
              />
              {this.copied ? "Copied" : "Copy"}
            </button>
          </div>
        ) : null}
        <pre className="overflow-x-auto p-4 text-[13px] leading-6 sm:p-5">
          <code className="font-mono">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {this.showLineNumbers ? (
                  <span className="text-brand-300 mr-4 w-6 shrink-0 text-right select-none dark:text-slate-600">
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
