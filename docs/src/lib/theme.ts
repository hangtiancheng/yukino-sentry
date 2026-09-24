export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "yukino-theme";

export function getInitialTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

type ThemeListener = (theme: Theme) => void;

class ThemeStore {
  private current: Theme = getInitialTheme();
  private listeners = new Set<ThemeListener>();

  get theme(): Theme {
    return this.current;
  }

  set(theme: Theme): void {
    this.current = theme;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#101113" : "#ffffff");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* storage may be unavailable */
    }
    for (const listener of this.listeners) {
      listener(theme);
    }
  }

  toggle(): void {
    this.set(this.current === "dark" ? "light" : "dark");
  }

  subscribe(listener: ThemeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const themeStore = new ThemeStore();
