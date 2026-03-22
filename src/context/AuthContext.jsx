// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

/**
 * AuthProvider wraps the entire app.
 *
 * onThemeChange — optional callback passed from App.jsx.
 * It should be ThemeContext.setThemeFromUser so the two contexts
 * stay fully decoupled (no circular import).
 */
export function AuthProvider({ children, onThemeChange }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply theme whenever the user object changes (login, refresh)
  useEffect(() => {
    if (user?.theme && onThemeChange) {
      onThemeChange(user.theme);
    }
  }, [user?.theme, onThemeChange]);

  // Restore session on page refresh
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await axios.get("/api/auth/me");
        setUser(data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const register = async (name, email, password) => {
    try {
      await axios.post("/api/auth/register", { name, email, password });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    }
  };

  const login = async (email, password) => {
    try {
      const { data: tokenData } = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", tokenData.token);
      const { data: me } = await axios.get("/api/auth/me");
      setUser(me);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Invalid email or password" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
