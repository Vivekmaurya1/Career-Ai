/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Theme definitions ─────────────────────────────────────────────────────────
export const THEMES = [
  { id: "lime", label: "Lime", accent: "#b8ff3c", bg: "#07080b" },
  { id: "amber", label: "Amber", accent: "#ffb038", bg: "#09080a" },
  { id: "cyan", label: "Cyan", accent: "#3cffc8", bg: "#060c0e" },
  { id: "violet", label: "Violet", accent: "#a78bfa", bg: "#080710" },
  { id: "rose", label: "Rose", accent: "#ff8fab", bg: "#0e0809" },
];

const STORAGE_KEY = "careerai-theme";
const DEFAULT_THEME = "lime";
const VALID_IDS = new Set(THEMES.map((t) => t.id));

const sanitize = (id) => (VALID_IDS.has(id) ? id : DEFAULT_THEME);

// ── Apply theme to DOM ────────────────────────────────────────────────────────
function applyTheme(id) {
  const safe = sanitize(id);
  document.documentElement.setAttribute("data-theme", safe);
}

// ── Context ───────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // ── Initial load (no flicker) ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const safe = sanitize(stored);
      setThemeState(safe);
      applyTheme(safe);
    } catch {
      applyTheme(DEFAULT_THEME);
    } finally {
      setMounted(true);
    }
  }, []);

  // ── Sync across tabs ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const newTheme = sanitize(e.newValue);
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ── Main setter ─────────────────────────────────────────────────────────────
  const setTheme = useCallback((id, { skipStorage = false } = {}) => {
    const safe = sanitize(id);

    document.body.classList.add("theme-switching");
    setTimeout(() => document.body.classList.remove("theme-switching"), 250);

    setThemeState(safe);
    applyTheme(safe);

    if (!skipStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, safe);
      } catch {}
    }
  }, []);

  // ── From backend (Auth sync) ────────────────────────────────────────────────
const setThemeFromUser = useCallback((userTheme) => {
  if (!userTheme) return;

  const local = localStorage.getItem(STORAGE_KEY);

  // 🔥 Prevent override if user already selected theme locally
  if (local && local !== userTheme) {
    return;
  }

  const safe = sanitize(userTheme);

  setThemeState(safe);
  applyTheme(safe);

  try {
    localStorage.setItem(STORAGE_KEY, safe);
  } catch {}
}, []);

  // ── Temporary override ──────────────────────────────────────────────────────
  const overrideTheme = useCallback((id) => {
    const previous = sanitize(localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME);

    applyTheme(id);

    return () => {
      applyTheme(previous);
    };
  }, []);

  const currentThemeMeta = THEMES.find((t) => t.id === theme) || THEMES[0];

  // Prevent UI flash
  if (!mounted) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes: THEMES,
        currentThemeMeta,
        setTheme,
        setThemeFromUser,
        overrideTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};

// ── Auth page theme helper ────────────────────────────────────────────────────
export function useAuthTheme(themeId = "amber") {
  const { overrideTheme } = useTheme();

  useEffect(() => {
    const restore = overrideTheme(themeId);
    return restore;
  }, [themeId, overrideTheme]);
}