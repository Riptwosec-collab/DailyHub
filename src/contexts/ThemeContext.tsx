"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type AppTheme = "dark" | "cream";

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

const DARK_DEFAULT_VERSION = "2026-06-29-dark-default";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("dark");

  useEffect(() => {
    try {
      const defaultVersion = localStorage.getItem("nimbusdaily_theme_default_version");
      if (defaultVersion !== DARK_DEFAULT_VERSION) {
        localStorage.setItem("nimbusdaily_theme", "dark");
        localStorage.setItem("nimbusdaily_theme_default_version", DARK_DEFAULT_VERSION);
        setThemeState("dark");
        return;
      }
      const userSetTheme = localStorage.getItem("nimbusdaily_theme_user_set") === "true";
      if (!userSetTheme) {
        localStorage.setItem("nimbusdaily_theme", "dark");
        setThemeState("dark");
        return;
      }
      const saved = localStorage.getItem("nimbusdaily_theme");
      if (saved === "dark" || saved === "cream") setThemeState(saved);
      if (saved === "sanook") {
        localStorage.setItem("nimbusdaily_theme", "dark");
        setThemeState("dark");
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
  }, [theme]);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem("nimbusdaily_theme", nextTheme);
      localStorage.setItem("nimbusdaily_theme_user_set", "true");
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const nextTheme = current === "dark" ? "cream" : "dark";
      try {
        localStorage.setItem("nimbusdaily_theme", nextTheme);
        localStorage.setItem("nimbusdaily_theme_user_set", "true");
      } catch {}
      return nextTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
