// pages/generate.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  GENERATE_ROLES, GENERATE_TIMES, GENERATE_DURATIONS, GENERATE_EXP_YEARS,
  GENERATE_EXPERIENCE_LEVELS, GENERATE_SESSION_KEY,
  GENERATE_LOG_LINES, GENERATE_WAITING_MSGS,
} from "../constants";

// ─── LoadingTerminal ──────────────────────────────────────────────────────────

function LoadingTerminal({ role, done, cancelled, onCancel }) {
  const [lines,    setLines]    = useState([`> Analyzing role: "${role}"`]);
  const [animDone, setAnimDone] = useState(false);
  const [waitIdx,  setWaitIdx]  = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < GENERATE_LOG_LINES.length) {
        setLines((prev) => [...prev, GENERATE_LOG_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setAnimDone(true);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!animDone || done || cancelled) return;
    const interval = setInterval(() => {
      setWaitIdx((prev) => (prev + 1) % GENERATE_WAITING_MSGS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [animDone, done, cancelled]);

  useEffect(() => {
    if (done)      setLines((prev) => [...prev, "> ✓ Complete. Redirecting..."]);
    if (cancelled) setLines((prev) => [...prev, "> ✕ Generation cancelled."]);
  }, [done, cancelled]);

  const lineColor = (line) => {
    if (typeof line !== "string")    return "var(--text-muted)";
    if (line.includes("✓"))          return "#4ade80";
    if (line.includes("✕"))          return "#f87171";
    if (line.includes("Analyzing"))  return "var(--accent)";
    return "var(--text-muted)";
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "calc(var(--navbar-height,56px) + 40px) 20px 40px",
      fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace", gap: 24,
    }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)", filter: "blur(40px)", opacity: 0.6 }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ maxWidth: 580, width: "100%", position: "relative", zIndex: 1 }}
      >
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}>PROCESSING</span>
        </div>

        {/* Terminal window */}
        <div style={{
          background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, overflow: "hidden", backdropFilter: "blur(24px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          {/* Titlebar */}
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[{ c: "#ef4444" }, { c: "#f59e0b" }, { c: "#22c55e" }].map(({ c }, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
            <span style={{ flex: 1, textAlign: "center", fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>roadmap-generator.sh</span>
          </div>

          {/* Log lines */}
          <div style={{ padding: "28px 28px 24px", minHeight: 320 }}>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                style={{ fontSize: 12, lineHeight: 2.1, color: lineColor(line), fontFamily: "'JetBrains Mono', monospace" }}
              >
                {line}
              </motion.div>
            ))}

            {animDone && !done && !cancelled && (
              <motion.div
                key={`wait-${waitIdx}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                style={{ fontSize: 12, lineHeight: 2.1, color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {GENERATE_WAITING_MSGS[waitIdx]}
              </motion.div>
            )}

            {!done && !cancelled && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ display: "inline-block", width: 8, height: 15, background: "var(--accent)", marginTop: 6, borderRadius: 1 }}
              />
            )}
          </div>
        </div>

        {/* Cancel button */}
        {!done && !cancelled && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
            style={{ marginTop: 20, display: "flex", justifyContent: "center" }}
          >
            <button
              onClick={onCancel}
              style={{
                padding: "10px 36px", background: "transparent",
                border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8,
                color: "#f87171", fontSize: 11, letterSpacing: "0.14em",
                cursor: "pointer", transition: "all 0.2s", fontFamily: "'JetBrains Mono', monospace",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.6)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
            >
              CANCEL GENERATION
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ─── LivePreview sidebar ──────────────────────────────────────────────────────

function LivePreview({ form, filledCount }) {
  const fields = [
    { k: "role",       v: form.role              || "—", color: form.role              ? "#e2e8f0" : "rgba(255,255,255,0.2)" },
    { k: "level",      v: form.level             ? form.level             : "—", color: form.level             ? "#a78bfa" : "rgba(255,255,255,0.2)" },
    { k: "experience", v: form.yearsOfExperience  ? form.yearsOfExperience : "—", color: form.yearsOfExperience  ? "#67e8f9" : "rgba(255,255,255,0.2)" },
    { k: "time/day",   v: form.time              ? `${form.time} hrs`     : "—", color: form.time              ? "var(--accent)" : "rgba(255,255,255,0.2)" },
    { k: "duration",   v: form.duration          ? form.duration          : "—", color: form.duration          ? "#4ade80" : "rgba(255,255,255,0.2)" },
  ];

  const isReady = form.role && form.level && form.yearsOfExperience && form.time;
  const pct = (filledCount / 5) * 100;

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, overflow: "hidden", backdropFilter: "blur(16px)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>
      {/* Header strip */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: isReady ? "#4ade80" : "rgba(255,255,255,0.2)", boxShadow: isReady ? "0 0 10px #4ade80" : "none", transition: "all 0.4s" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>LIVE PREVIEW</span>
        </div>
        <span style={{
          fontSize: 9, letterSpacing: "0.12em", padding: "3px 10px", borderRadius: 20,
          background: isReady ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.05)",
          color: isReady ? "#4ade80" : "rgba(255,255,255,0.3)",
          border: `1px solid ${isReady ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"}`,
          transition: "all 0.4s", fontFamily: "'JetBrains Mono', monospace",
        }}>
          {isReady ? "READY" : "PENDING"}
        </span>
      </div>

      {/* Fields */}
      <div style={{ padding: "20px 20px 8px" }}>
        {fields.map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < fields.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>{f.k}</span>
            <span style={{ fontSize: 12, color: f.color, transition: "color 0.3s", fontFamily: "'JetBrains Mono', monospace", maxWidth: 160, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.v}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ padding: "16px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>READINESS</span>
          <span style={{ fontSize: 9, color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}>{filledCount}/5</span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, var(--accent), #4ade80)" }}
          />
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2, borderRadius: 99, background: i < filledCount ? "var(--accent)" : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Generate (main page) ─────────────────────────────────────────────────────

export default function Generate() {
  const navigate = useNavigate();

  const getSaved = () => {
    try { const raw = sessionStorage.getItem(GENERATE_SESSION_KEY); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  };
  const saved = getSaved();

  const [form, setForm] = useState(
    saved?.form || { role: "", level: "", yearsOfExperience: "", time: "", duration: "" }
  );
  const [loading,   setLoading]   = useState(saved?.loading || false);
  const [done,      setDone]      = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error,     setError]     = useState("");

  const abortCtrlRef  = useRef(null);
  const roadmapIdRef  = useRef(null);
  const loadingRef    = useRef(loading);
  const didRetry      = useRef(false);

  useEffect(() => { loadingRef.current = loading; }, [loading]);

  useEffect(() => {
    const handler = (e) => {
      if (!loadingRef.current) return;
      e.preventDefault(); e.returnValue = "Roadmap is still generating. Are you sure you want to leave?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    window.history.pushState({ sentinel: true }, "");
    const handlePop = () => {
      if (!loadingRef.current) return;
      window.history.pushState({ sentinel: true }, "");
      const confirmed = window.confirm("Roadmap is still generating. Are you sure you want to leave?");
      if (confirmed) { sessionStorage.removeItem(GENERATE_SESSION_KEY); window.history.go(-2); }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(GENERATE_SESSION_KEY, JSON.stringify({ form, loading })); } catch {}
  }, [form, loading]);

  const runGenerate = async (payload) => {
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;
    roadmapIdRef.current = null;
    const res = await axios.post("/api/roadmap/generate", payload, { signal: ctrl.signal });
    if (!res.data.id) throw new Error("No roadmap ID");
    roadmapIdRef.current = res.data.id;
    if (ctrl.signal.aborted) {
      try { await axios.delete(`/api/roadmap/${res.data.id}`); } catch {}
      return null;
    }
    return res.data.id;
  };

  useEffect(() => {
    if (saved?.loading && saved?.form?.role && !didRetry.current) {
      didRetry.current = true;
      setLoading(true);
      (async () => {
        try {
          const id = await runGenerate({
            role: saved.form.role, level: saved.form.level,
            yearsOfExperience: saved.form.yearsOfExperience,
            timePerDay: saved.form.time, duration: saved.form.duration,
          });
          if (id === null) return;
          sessionStorage.removeItem(GENERATE_SESSION_KEY);
          setDone(true);
          setTimeout(() => navigate(`/roadmap/${id}`), 1400);
        } catch (err) {
          if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
          setError(err.response?.data?.message || err.message || "Generation failed.");
          setLoading(false);
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async () => {
    abortCtrlRef.current?.abort();
    if (roadmapIdRef.current) {
      try { await axios.delete(`/api/roadmap/${roadmapIdRef.current}`); } catch {}
    }
    setCancelled(true); setLoading(false);
    sessionStorage.removeItem(GENERATE_SESSION_KEY);
    setTimeout(() => setCancelled(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role.trim())        return setError("Please enter a target role");
    if (!form.level)              return setError("Please select experience level");
    if (!form.yearsOfExperience)  return setError("Please select years of experience");
    if (!form.time)               return setError("Please select daily study time");
    setError(""); setLoading(true);
    try {
      const id = await runGenerate({
        role: form.role, level: form.level,
        yearsOfExperience: form.yearsOfExperience,
        timePerDay: form.time, duration: form.duration,
      });
      if (id === null) return;
      sessionStorage.removeItem(GENERATE_SESSION_KEY);
      setDone(true);
      setTimeout(() => navigate(`/roadmap/${id}`), 1400);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      setError(err.response?.data?.message || err.message || "Generation failed.");
      setLoading(false);
    }
  };

  if (loading || cancelled) {
    return <LoadingTerminal role={form.role} done={done} cancelled={cancelled} onCancel={handleCancel} />;
  }

  const filledCount = [form.role, form.level, form.yearsOfExperience, form.time, form.duration].filter(Boolean).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .gen-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Outfit', sans-serif;
          padding: calc(var(--navbar-height, 56px) + 56px) 32px 100px;
          position: relative;
          overflow-x: hidden;
          color: var(--text);
        }

        /* Layered background */
        .gen-bg-mesh {
          position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0;
        }
        .gen-bg-mesh::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 10% 10%, var(--accent-dim) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 90% 80%, rgba(167,139,250,0.06) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(6,182,212,0.03) 0%, transparent 60%);
        }
        .gen-bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black, transparent);
        }

        /* Floating orb decorations */
        .gen-orb {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(60px);
        }

        /* Step number */
        .step-num {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--accent);
          opacity: 0.7;
          margin-bottom: 6px;
        }
        .step-label {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-heading, #f1f5f9);
          letter-spacing: 0.01em;
          margin-bottom: 3px;
        }
        .step-hint {
          font-size: 12.5px;
          color: rgba(255,255,255,0.35);
          font-weight: 400;
        }

        /* Text input */
        .gen-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .gen-input:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 56,189,248), 0.12) !important;
          background: rgba(255,255,255,0.06) !important;
        }
        .gen-input::placeholder { color: rgba(255,255,255,0.2); }

        /* Pill suggestions */
        .role-pill {
          padding: 6px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 99px;
          color: rgba(255,255,255,0.45);
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .role-pill:hover {
          background: rgba(255,255,255,0.08);
          color: var(--text);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .role-pill.sel {
          background: rgba(var(--accent-rgb, 56,189,248), 0.12);
          border-color: var(--accent);
          color: var(--accent);
        }

        /* Level cards */
        .level-card {
          flex: 1;
          padding: 18px 12px 16px;
          border-radius: 14px;
          cursor: pointer;
          text-align: center;
          transition: all 0.18s;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          position: relative;
          overflow: hidden;
        }
        .level-card::before {
          content: '';
          position: absolute; inset: 0;
          opacity: 0; transition: opacity 0.2s;
          background: radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb, 56,189,248), 0.15), transparent 70%);
        }
        .level-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
        .level-card:hover::before { opacity: 0.5; }
        .level-card.sel { border-color: var(--accent); background: rgba(var(--accent-rgb, 56,189,248), 0.08); }
        .level-card.sel::before { opacity: 1; }

        /* Exp year cards */
        .exp-card {
          padding: 14px 8px;
          border-radius: 10px;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          flex: 1 1 calc(20% - 8px);
          min-width: 90px;
        }
        .exp-card:hover { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); transform: translateY(-1px); }
        .exp-card.sel { border-color: var(--accent); background: rgba(var(--accent-rgb, 56,189,248), 0.1); }

        /* Time/Duration pills */
        .time-pill {
          padding: 9px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.45);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .time-pill:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.18); color: var(--text); }
        .time-pill.sel {
          background: rgba(var(--accent-rgb, 56,189,248), 0.12);
          border-color: var(--accent);
          color: var(--accent);
          box-shadow: 0 4px 16px rgba(var(--accent-rgb, 56,189,248), 0.15);
        }

        /* Submit button */
        .gen-btn {
          width: 100%;
          min-height: 54px;
          padding: 0 40px;
          background: linear-gradient(135deg, var(--accent) 0%, #818cf8 100%);
          color: #030712;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          border: none;
          cursor: pointer;
          border-radius: 14px;
          transition: all 0.22s;
          position: relative;
          overflow: hidden;
        }
        .gen-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent 60%);
          opacity: 0; transition: opacity 0.2s;
        }
        .gen-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 48px rgba(var(--accent-rgb, 56,189,248), 0.35);
        }
        .gen-btn:hover:not(:disabled)::before { opacity: 1; }
        .gen-btn:active:not(:disabled) { transform: translateY(0); }
        .gen-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        /* Divider */
        .field-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 4px 0;
        }

        @media (max-width: 800px) {
          .gen-layout { grid-template-columns: 1fr !important; }
          .gen-sidebar { position: static !important; }
        }
      `}</style>

      <div className="gen-root">
        {/* Background layers */}
        <div className="gen-bg-mesh" />
        <div className="gen-bg-grid" />
        <div className="gen-orb" style={{ width: 400, height: 400, top: "-10%", left: "-8%", background: "radial-gradient(circle, var(--accent-dim), transparent 70%)", opacity: 0.5, animation: "float-slow 14s ease-in-out infinite" }} />
        <div className="gen-orb" style={{ width: 280, height: 280, bottom: "10%", right: "-5%", background: "radial-gradient(circle, rgba(129,140,248,0.06), transparent 70%)", animation: "float-slow 18s ease-in-out infinite reverse" }} />

        <div style={{ maxWidth: 980, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 64 }}
          >
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 99, marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)", animation: "pulse-ring 2s ease-out infinite" }} />
              <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}>ROADMAP GENERATOR</span>
            </div>

            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(42px, 6vw, 80px)",
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-heading, #f1f5f9)",
              margin: 0,
            }}>
              Build Your<br />
              <span style={{
                background: "linear-gradient(135deg, var(--accent), #818cf8 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Learning Path</span>
            </h1>
            <p style={{ marginTop: 16, fontSize: 15, color: "rgba(255,255,255,0.35)", fontWeight: 400, maxWidth: 440 }}>
              Answer a few questions and we'll generate a personalized curriculum tailored to your goals.
            </p>
          </motion.div>

          {/* ── Form + Sidebar grid ── */}
          <form onSubmit={handleSubmit}>
            <div className="gen-layout" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48 }}>

              {/* ─── LEFT: form fields ─── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

                {/* 01 — Target Role */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <FieldHeader num="01" label="Target Role" hint="What position are you aiming for?" />
                  <input
                    className="gen-input"
                    type="text"
                    placeholder="e.g. Frontend Developer, Data Scientist..."
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                    {GENERATE_ROLES.map((r) => (
                      <button key={r} type="button"
                        className={`role-pill${form.role === r ? " sel" : ""}`}
                        onClick={() => setForm({ ...form, role: r })}
                      >{r}</button>
                    ))}
                  </div>
                </motion.div>

                <div className="field-divider" />

                {/* 02 — Experience Level */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <FieldHeader num="02" label="Experience Level" hint="Be honest — it helps tailor the plan." />
                  <div style={{ display: "flex", gap: 10 }}>
                    {GENERATE_EXPERIENCE_LEVELS.map((l) => (
                      <button
                        key={l.val} type="button"
                        className={`level-card${form.level === l.val ? " sel" : ""}`}
                        onClick={() => setForm({ ...form, level: l.val })}
                      >
                        <div style={{ fontSize: 22, marginBottom: 8, filter: form.level === l.val ? "none" : "grayscale(0.4)" }}>{l.icon}</div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: form.level === l.val ? "var(--accent)" : "rgba(255,255,255,0.5)", marginBottom: 4, transition: "color 0.2s" }}>{l.val.toUpperCase()}</div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10.5, color: "rgba(255,255,255,0.25)" }}>{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                <div className="field-divider" />

                {/* 03 — Years of Experience */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <FieldHeader num="03" label="Years of Experience" hint="How long have you been in the field?" />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {GENERATE_EXP_YEARS.map((exp) => (
                      <button key={exp} type="button"
                        className={`exp-card${form.yearsOfExperience === exp ? " sel" : ""}`}
                        onClick={() => setForm({ ...form, yearsOfExperience: exp })}
                      >
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: form.yearsOfExperience === exp ? "var(--accent)" : "rgba(255,255,255,0.5)", transition: "color 0.15s" }}>{exp}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                <div className="field-divider" />

                {/* 04 & 05 — Daily Time + Duration */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                    <div>
                      <FieldHeader num="04" label="Daily Time" hint="Hours available per day" />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {GENERATE_TIMES.map((t) => (
                          <button key={t} type="button"
                            className={`time-pill${form.time === t ? " sel" : ""}`}
                            onClick={() => setForm({ ...form, time: t })}
                          >{t}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <FieldHeader num="05" label="Duration" hint="Target completion timeline" />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {GENERATE_DURATIONS.map((d) => (
                          <button key={d} type="button"
                            className={`time-pill${form.duration === d ? " sel" : ""}`}
                            onClick={() => setForm({ ...form, duration: d })}
                          >{d}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, fontSize: 13, color: "#f87171", fontWeight: 500 }}
                    >
                      <span style={{ fontSize: 16 }}>⚠</span> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <button type="submit" className="gen-btn" disabled={filledCount < 4}>
                    GENERATE MY ROADMAP →
                  </button>
                  {filledCount < 4 && (
                    <p style={{ textAlign: "center", fontSize: 11.5, color: "rgba(255,255,255,0.22)", marginTop: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                      complete {4 - filledCount} more field{4 - filledCount !== 1 ? "s" : ""} to continue
                    </p>
                  )}
                </motion.div>
              </div>

              {/* ─── RIGHT: live preview ─── */}
              <motion.div
                className="gen-sidebar"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                style={{ position: "sticky", top: "calc(var(--navbar-height, 56px) + 24px)", alignSelf: "start" }}
              >
                <LivePreview form={form} filledCount={filledCount} />
              </motion.div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── FieldHeader ──────────────────────────────────────────────────────────────

function FieldHeader({ num, label, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="step-num">{`STEP ${num}`}</div>
      <div className="step-label">{label}</div>
      <div className="step-hint">{hint}</div>
    </div>  
  );
}