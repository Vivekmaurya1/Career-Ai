/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios"; // ✅ IMPORTANT

const AuthContext = createContext(null);

export function AuthProvider({ children, onThemeChange }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply theme
  const applyTheme = useCallback(
    (theme) => {
      if (theme && onThemeChange) {
        onThemeChange(theme);
      }
    },
    [onThemeChange]
  );

  // Central user setter
  const updateUser = useCallback(
    (userData) => {
      setUser(userData);
      applyTheme(userData?.theme);
    },
    [applyTheme]
  );

  // Restore session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/auth/me");
        updateUser(res.data);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [updateUser]);

  // Register
  const register = useCallback(async (name, email, password) => {
    try {
      await api.post("/api/auth/register", { name, email, password });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  }, []);

  // Login
  const login = useCallback(
    async (email, password) => {
      try {
        const res = await api.post("/api/auth/login", { email, password });

        const { token } = res.data;

        localStorage.setItem("token", token);

        // Fetch user
        const meRes = await api.get("/api/auth/me");

        updateUser(meRes.data);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Login failed",
        };
      }
    },
    [updateUser]
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);

    // Fix: use valid theme id
    applyTheme("lime");
  }, [applyTheme]);

  // Initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,
        login,
        register,
        logout,
        loading,
        initials,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};