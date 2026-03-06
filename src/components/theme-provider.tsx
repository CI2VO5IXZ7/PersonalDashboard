"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  backgroundImage: string | null;
  setTheme: (theme: Theme) => void;
  setBackgroundImage: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  resolvedTheme: "dark",
  backgroundImage: null,
  setTheme: () => {},
  setBackgroundImage: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const lightVars: Record<string, string> = {
  "--background": "#f1f5f9",
  "--foreground": "#0f172a",
  "--card": "#ffffff",
  "--card-hover": "#f8fafc",
  "--border": "#e2e8f0",
  "--muted": "#64748b",
  "--accent": "#3b82f6",
  "--accent-light": "#2563eb",
};

const darkVars: Record<string, string> = {
  "--background": "#0f172a",
  "--foreground": "#e2e8f0",
  "--card": "#1e293b",
  "--card-hover": "#253349",
  "--border": "#334155",
  "--muted": "#64748b",
  "--accent": "#3b82f6",
  "--accent-light": "#60a5fa",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [backgroundImage, setBgState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  const applyTheme = useCallback((resolved: "light" | "dark") => {
    const vars = resolved === "light" ? lightVars : darkVars;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const t = (d.data.theme || "dark") as Theme;
          setThemeState(t);
          setBgState(d.data.backgroundImage || null);
          const resolved = t === "system" ? getSystemTheme() : t;
          applyTheme(resolved);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [applyTheme, getSystemTheme]);

  useEffect(() => {
    if (loaded) applyTheme(resolvedTheme);
  }, [resolvedTheme, loaded, applyTheme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyTheme, getSystemTheme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    const resolved = t === "system" ? getSystemTheme() : t;
    applyTheme(resolved);
  }

  function setBackgroundImage(url: string | null) {
    setBgState(url);
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, backgroundImage, setTheme, setBackgroundImage }}>
      {children}
    </ThemeContext.Provider>
  );
}
