// src/context/ThemeContext.jsx
//
// HOW IT WORKS:
// 1. On mount, reads theme from localStorage as an instant fallback (no flash)
// 2. When AuthContext gives us a user, we override with their DB-persisted theme
// 3. applyTheme() sets data-theme="<id>" on <html> — index.css does the rest
// 4. saveTheme() calls PUT /api/auth/me and keeps localStorage in sync
// 5. Any component can call useTheme() to read/change the theme

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "../api/axios";

const ThemeContext = createContext();

export const THEMES = [
  { id: "dark",   label: "Dark Terminal",  bg: "#080808", accent: "#f59e0b" },
  { id: "darker", label: "Pitch Black",    bg: "#000000", accent: "#f59e0b" },
  { id: "amber",  label: "Amber Night",    bg: "#0d0800", accent: "#f97316" },
  { id: "green",  label: "Matrix",         bg: "#010d01", accent: "#22c55e" },
  { id: "blue",   label: "Cyberpunk Blue", bg: "#00050d", accent: "#60a5fa" },
  { id: "violet", label: "Deep Purple",    bg: "#05010d", accent: "#a78bfa" },
];

const VALID_IDS = THEMES.map(t => t.id);
const sanitize  = (id) => VALID_IDS.includes(id) ? id : "dark";

function applyTheme(id) {
  document.documentElement.setAttribute("data-theme", sanitize(id));
}

export function ThemeProvider({ children }) {
  // Instant read from localStorage — prevents a white/wrong-color flash on load
  const [theme, setThemeState] = useState(() => {
    return sanitize(localStorage.getItem("careerai-theme") || "dark");
  });

  // Apply immediately on first render
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Called by AuthContext after login or page-refresh /me fetch
  // so the DB value always wins over localStorage
  const setThemeFromUser = useCallback((userTheme) => {
    const id = sanitize(userTheme);
    setThemeState(id);
    localStorage.setItem("careerai-theme", id);
    applyTheme(id);
  }, []);

  // Called from settings page — saves to DB AND updates local state
  const saveTheme = useCallback(async (id) => {
    const safe = sanitize(id);
    // Optimistic update — feels instant
    setThemeState(safe);
    localStorage.setItem("careerai-theme", safe);
    applyTheme(safe);

    // Persist to backend
    await axios.put("/api/auth/me", { theme: safe });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, saveTheme, setThemeFromUser, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);