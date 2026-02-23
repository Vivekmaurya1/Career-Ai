// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── FIXED: Removed the duplicate request interceptor that was here.
  // The axios instance in api/axios.js already attaches the token to every request.
  // Adding a second interceptor here caused the header to be set twice and
  // created a new interceptor registration on every render cycle.

  /* ── Restore user on page refresh ── */
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("/api/auth/me");
        setUser(response.data);
      } catch {
        // Token expired or invalid — clear it
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  /* ── Register ── */
  const register = async (name, email, password) => {
    try {
      await axios.post("/api/auth/register", { name, email, password });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  /* ── Login ── */
  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);

      const me = await axios.get("/api/auth/me");
      setUser(me.data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid email or password",
      };
    }
  };

  /* ── Logout ── */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);