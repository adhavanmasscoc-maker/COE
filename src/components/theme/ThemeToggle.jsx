"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg border border-slate-700 bg-slate-800/50 ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`p-2 rounded-xl transition-all duration-200 border border-border bg-card hover:bg-secondary text-foreground hover:text-primary ${className}`}
      title={theme === "dark" ? "Switch to Focus-First Light Mode" : "Switch to Eye-Friendly Dark Navy"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 text-sky-600 transition-transform -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
