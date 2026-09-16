"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (preference: ThemePreference) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? "light" : "dark";
}

function getStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Fall back to the system preference when storage is unavailable.
  }
  return "system";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "system";
    return getStoredPreference();
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const current = document.documentElement.dataset.theme as Theme | undefined;
    return current === "light" || current === "dark" ? current : getSystemTheme();
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const applyTheme = (nextPreference: ThemePreference) => {
      const nextTheme = nextPreference === "system"
        ? (mediaQuery.matches ? "light" : "dark")
        : nextPreference;
      setThemeState(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
    };

    applyTheme(preference);

    try {
      localStorage.setItem("theme", preference);
    } catch {
      // Storage may be blocked; the in-memory theme still works.
    }

    const handleSystemThemeChange = () => {
      if (preference === "system") applyTheme("system");
    };
    mediaQuery.addEventListener?.("change", handleSystemThemeChange);

    return () => mediaQuery.removeEventListener?.("change", handleSystemThemeChange);
  }, [preference]);

  const setTheme = (nextPreference: ThemePreference) => {
    setPreference(nextPreference);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, preference, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
