import en from "@/locales/en.json";

export type Messages = typeof en;

type Leaves<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`;
    }[keyof T & string];

export type MessageKey = Leaves<Messages>;

function lookup(catalog: unknown, path: string): string | undefined {
  let node: unknown = catalog;
  for (const part of path.split(".")) {
    if (
      node !== null &&
      typeof node === "object" &&
      part in (node as Record<string, unknown>)
    ) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

export function t(
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  let text = lookup(en, key) ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

function applyDocumentMeta(): void {
  document.documentElement.lang = "en";
  document.title = t("meta.title");
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t("meta.description"));
}

applyDocumentMeta();
