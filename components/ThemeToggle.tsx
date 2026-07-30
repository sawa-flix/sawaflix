"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      aria-pressed={theme === "light"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--secondary)] bg-[color:var(--card-bg)]/90 text-lg shadow-sm transition hover:scale-105"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
