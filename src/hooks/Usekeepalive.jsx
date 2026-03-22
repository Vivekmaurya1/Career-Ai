// hooks/useKeepAlive.js
import { useEffect } from "react";
import axios from "../api/axios";
import { KEEP_ALIVE_INTERVAL_MS } from "../constants";

/**
 * Pings the backend on mount and then every `intervalMs` milliseconds.
 * Prevents Render / Railway free-tier cold starts.
 *
 * Usage:  useKeepAlive()          — in any component
 *         <KeepAlive />           — drop-in component (no visible output)
 */
export function useKeepAlive(intervalMs = KEEP_ALIVE_INTERVAL_MS) {
  useEffect(() => {
    const ping = () => axios.get("/api/auth/ping").catch(() => {});
    ping(); // wake up immediately on mount
    const id = setInterval(ping, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

/** Drop-in component — add <KeepAlive /> anywhere in App.jsx */
export function KeepAlive() {
  useKeepAlive();
  return null;
}