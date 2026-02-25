// src/hooks/useKeepAlive.js
import { useEffect } from "react";
import axios from "../api/axios";

/**
 * Pings the backend every 10 minutes to prevent Render free tier cold starts.
 * Add <KeepAlive /> anywhere in your app tree (e.g. inside App.jsx).
 */
export function useKeepAlive(intervalMs = 10 * 60 * 1000) {
  useEffect(() => {
    // Ping immediately on mount so the server wakes up before user tries to log in
    const ping = () => {
        // fallback if actuator not enabled — any public endpoint works
        axios.get("/api/auth/ping").catch(() => {});
    };

    ping(); // immediate wake-up ping
    const id = setInterval(ping, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

// Drop-in component version — just add <KeepAlive /> to App.jsx
export function KeepAlive() {
  useKeepAlive();
  return null;
}