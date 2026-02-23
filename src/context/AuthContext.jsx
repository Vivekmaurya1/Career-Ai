import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔁 Restore User On Refresh */
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
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  /* 🔐 Login */
  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password
      });

      const token = response.data.token;

      localStorage.setItem("token", token);

      const meResponse = await axios.get("/api/auth/me");
      setUser(meResponse.data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Invalid email or password"
      };
    }
  };

  /* 📝 Register */
  const register = async (username, email, password) => {
    try {
      await axios.post("/api/auth/register", {
        name,
        email,
        password
      });

      return { success: true };
    } catch (error) {
      return {
        success: false, 
        message:
          error.response?.data?.message || "Registration failed"
      };
    }
  };

  /* 🚪 Logout */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);