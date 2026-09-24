import { LitElement, customElement, property, state } from "@yukino.js/lit-jsx";
import { cn } from "@/lib/cn";
import { LocaleController, t } from "@/lib/i18n";
import { Icon } from "@/components/icons/icon";

declare global {
  interface HTMLElementTagNameMap {
    "copy-button": CopyButtonElement;
  }
}

@customElement("copy-button")
export class CopyButtonElement extends LitElement {
  @property() value = "";
  @property() label = "";
  @property() buttonClass?: string;
  @state() private copied = false;

  private timer: number | null = null;

  locale = new LocaleController(this);

  override createRenderRoot(): HTMLElement {
    return this;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer !== null) window.clearTimeout(this.timer);
  }

  private async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.value);
      this.copied = true;
      if (this.timer !== null) window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.copied = false;
      }, 1900);
    } catch {}
  }

  override render() {
    return (
      <button
        type="button"
        onClick={() => void this.copy()}
        aria-label={
          this.copied ? t("common.copied") : this.label || t("common.copy")
        }
        className={cn(
          "hover:bg-brand-500/10 hover:text-brand-950 focus-visible:outline-brand-500 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors focus-visible:outline-2 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white",
          this.buttonClass,
        )}
      >
        {this.copied ? (
          <Icon name="check" className="text-g-green-600 size-4" />
        ) : (
          <Icon
            name="copy"
            className="size-4 transition-transform group-hover:scale-105"
          />
        )}
      </button>
    );
  }
}

export function CommandBar({
  command,
  className,
}: {
  command: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shadow-soft border-brand-950/10 flex items-center gap-2 rounded-2xl border bg-white/85 p-1.5 pl-4 backdrop-blur dark:border-white/10 dark:bg-white/4 dark:shadow-none",
        className,
      )}
    >
      <code className="flex-1 truncate px-1 font-mono text-[13px] text-zinc-700 dark:text-zinc-300">
        {command}
      </code>
      <copy-button value={command} />
    </div>
  );
}
