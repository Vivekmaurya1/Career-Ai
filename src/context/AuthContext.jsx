// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

// NOTE: ThemeContext is NOT imported here to avoid a circular dependency.
// Instead, AuthContext accepts an optional `onThemeChange` callback that
// App.jsx passes down. This keeps the two contexts fully decoupled.

export const AuthProvider = ({ children, onThemeChange }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Apply theme whenever user changes ───────────────────────────────── */
  // onThemeChange is ThemeContext.setThemeFromUser, passed from App.jsx
  useEffect(() => {
    if (user?.theme && onThemeChange) {
      onThemeChange(user.theme);
    }
  }, [user?.theme, onThemeChange]);

  /* ── Restore session on page refresh ────────────────────────────────── */
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }

      try {
        const { data } = await axios.get("/api/auth/me");
        setUser(data);
        // theme applied via the useEffect above when user state updates
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreUser();
  }, []);

  /* ── Register ────────────────────────────────────────────────────────── */
  const register = async (name, email, password) => {
    try {
      await axios.post("/api/auth/register", { name, email, password });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  /* ── Login ───────────────────────────────────────────────────────────── */
  const login = async (email, password) => {
    try {
      const { data: tokenData } = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", tokenData.token);

      // Fetch full profile (includes theme)
      const { data: me } = await axios.get("/api/auth/me");
      setUser(me);
      // theme applied via useEffect above

      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Invalid email or password" };
    }
  };

  /* ── Logout ──────────────────────────────────────────────────────────── */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);