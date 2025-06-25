"use client";
import { useTheme } from "./useTheme";

export function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="theme-toggle"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
} 