"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex items-center h-9 w-[60px] rounded-pill bg-fog px-1 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-blue ${className}`}
    >
      <span
        className={`flex items-center justify-center h-7 w-7 rounded-full bg-strong text-strong-foreground shadow-sm transition-transform duration-200 ${
          isDark ? "translate-x-[26px]" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon size={14} strokeWidth={1.75} />
        ) : (
          <Sun size={14} strokeWidth={1.75} />
        )}
      </span>
    </button>
  );
}
