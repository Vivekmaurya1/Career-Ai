// src/components/ServerWakeup.jsx
// Drop this banner on your Login/Register page.
// It detects if the server is slow to respond and shows a friendly message.

import { useState, useEffect } from "react";
import axios from "../api/axios";

export default function ServerWakeup() {
  const [status, setStatus] = useState("checking"); // "checking" | "awake" | "waking"

  useEffect(() => {
    const start = Date.now();

    const check = async () => {
      try {
        await axios.get("/api/auth/ping");
        const elapsed = Date.now() - start;
        // If it responded in under 2s it was already awake
        setStatus(elapsed < 2000 ? "awake" : "awake");
      } catch {
        setStatus("waking");
        // Retry every 5s until it responds
        setTimeout(check, 5000);
      }
    };

    // Wait 1.5s before showing anything — avoids flash on fast connections
    const timer = setTimeout(() => {
      check();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (status === "awake" || status === "checking") return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 1000, display: "flex", alignItems: "center", gap: 12,
      padding: "12px 20px",
      background: "#0e0e0e",
      border: "1px solid rgba(245,158,11,0.3)",
      borderRadius: 4,
      fontFamily: "'IBM Plex Mono', monospace",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      whiteSpace: "nowrap",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{
        width: 12, height: 12, flexShrink: 0,
        border: "1.5px solid rgba(245,158,11,0.3)",
        borderTopColor: "#f59e0b", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div>
        <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: "0.12em" }}>
          WAKING UP SERVER...
        </div>
        <div style={{ fontSize: 9, color: "rgba(232,232,232,0.3)", marginTop: 2, letterSpacing: "0.08em" }}>
          Free tier cold start — usually takes 30–60s
        </div>
      </div>
    </div>
  );
}