import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "dashboard-theme";

function readStoredTheme(): "dark" | "light" {
  return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(readStoredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
