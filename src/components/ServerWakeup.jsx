// components/ServerWakeup.jsx
// Drop this on your Login/Register pages.
// Detects cold-start delays and shows a non-intrusive toast.
import { useState, useEffect } from "react";
import axios from "../api/axios";

const PING_ROUTE     = "/api/auth/ping";
const FAST_THRESHOLD = 2000; // ms — under this = server was already awake
const CHECK_DELAY    = 1500; // ms — wait before pinging to avoid flash on fast connections
const RETRY_INTERVAL = 5000; // ms — retry interval on failure

export default function ServerWakeup() {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    let retryTimer;

    const check = async () => {
      const start = Date.now();
      try {
        await axios.get(PING_ROUTE);
        const elapsed = Date.now() - start;
        if (elapsed >= FAST_THRESHOLD) setWaking(false); // awoke
      } catch {
        setWaking(true);
        retryTimer = setTimeout(check, RETRY_INTERVAL);
      }
    };

    const initialTimer = setTimeout(check, CHECK_DELAY);
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(retryTimer);
    };
  }, []);

  if (!waking) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 1000, display: "flex", alignItems: "center", gap: 12,
      padding: "12px 20px",
      background: "#0e0e1a",
      border: "1px solid rgba(245,158,11,0.3)",
      borderRadius: 6,
      fontFamily: "'IBM Plex Mono', monospace",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      whiteSpace: "nowrap",
    }}>
      <style>{`@keyframes swSpin { to { transform: rotate(360deg) } }`}</style>
      <div style={{
        width: 12, height: 12, flexShrink: 0,
        border: "1.5px solid rgba(245,158,11,0.3)",
        borderTopColor: "#f59e0b", borderRadius: "50%",
        animation: "swSpin 0.8s linear infinite",
      }} />
      <div>
        <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: "0.12em" }}>
          WAKING UP SERVER…
        </div>
        <div style={{ fontSize: 9, color: "rgba(232,232,232,0.3)", marginTop: 2, letterSpacing: "0.08em" }}>
          Free tier cold start — usually 30–60s
        </div>
      </div>
    </div>
  );
}