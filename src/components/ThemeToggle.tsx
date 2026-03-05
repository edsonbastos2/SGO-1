"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { clsx } from "clsx";

interface ThemeToggleProps {
  variant?: "icon" | "pill";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "pill") {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
        className={clsx(
          "relative flex items-center gap-1 p-1 rounded-full border transition-all duration-200",
          "border-[var(--border-default)] bg-[var(--bg-subtle)]",
          "hover:border-[var(--border-strong)]",
          className,
        )}
      >
        {/* Sun */}
        <span
          className={clsx(
            "flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200",
            !isDark
              ? "bg-[var(--bg-surface)] shadow-sm text-[var(--warning)]"
              : "text-[var(--text-disabled)]",
          )}
        >
          <Sun size={14} />
        </span>
        {/* Moon */}
        <span
          className={clsx(
            "flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200",
            isDark
              ? "bg-[var(--bg-surface)] shadow-sm text-[var(--accent)]"
              : "text-[var(--text-disabled)]",
          )}
        >
          <Moon size={14} />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className={clsx(
        "flex items-center justify-center w-9 h-9 rounded-lg",
        "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
        "hover:bg-[var(--bg-hover)] border border-transparent",
        "hover:border-[var(--border-subtle)]",
        "transition-all duration-150",
        className,
      )}
    >
      {isDark ? (
        <Sun
          size={16}
          className="transition-transform duration-300 rotate-0 hover:rotate-12"
        />
      ) : (
        <Moon size={16} className="transition-transform duration-300" />
      )}
    </button>
  );
}
