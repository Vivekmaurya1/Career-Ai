// src/pages/generate.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { motion } from "framer-motion";

const ROLES     = ["Frontend Developer","Backend Developer","Full Stack Engineer","Data Scientist","ML Engineer","DevOps Engineer","Mobile Developer","Product Manager","UI/UX Designer","Cloud Architect"];
const TIMES     = ["30 min","1 hour","2 hours","3 hours","4+ hours"];
const DURATIONS = ["1 month","2 months","3 months","6 months","12 months"];
const SESSION_KEY = "roadmap_generation_state";

// ─── Log lines shown during animation ───────────────────────────────────────

const LOG_LINES = [
  "> Scanning 10,000+ career trajectories...",
  "> Mapping prerequisite graph...",
  "> Building phase structure...",
  "> Generating weekly schedule...",
  "> Preparing project suggestions...",
  "> Compiling interview prep suite...",
  "> Finalizing your roadmap...",
];

const WAITING_MSGS = [
  "> Server is processing...",
  "> Almost there...",
  "> Hang tight...",
  "> Crunching data...",
  "> Polishing your roadmap...",
];

// ─── Loading Terminal ────────────────────────────────────────────────────────

function LoadingTerminal({ role, done, cancelled, onCancel }) {
  const [lines, setLines]       = useState([`> Analyzing role: "${role}"`]);
  const [animDone, setAnimDone] = useState(false);
  const [waitIdx, setWaitIdx]   = useState(0);

  // Play through LOG_LINES once
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < LOG_LINES.length) {
        setLines(prev => [...prev, LOG_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setAnimDone(true);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Cycle waiting messages after animation ends, until API responds or cancelled
  useEffect(() => {
    if (!animDone || done || cancelled) return;
    const interval = setInterval(() => {
      setWaitIdx(prev => (prev + 1) % WAITING_MSGS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [animDone, done, cancelled]);

  // Append result line when done or cancelled
  useEffect(() => {
    if (done)      setLines(prev => [...prev, "> ✓ Complete. Redirecting..."]);
    if (cancelled) setLines(prev => [...prev, "> ✕ Generation cancelled."]);
  }, [done, cancelled]);

  const getColor = (line) => {
    if (typeof line !== "string") return "rgba(232,232,232,0.6)";
    if (line.includes("✓"))      return "#22c55e";
    if (line.includes("✕"))      return "#ef4444";
    if (line.includes("Analyzing")) return "#f59e0b";
    return "rgba(232,232,232,0.6)";
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080808", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "calc(var(--navbar-height,56px) + 40px) 20px 40px",
      fontFamily: "'IBM Plex Mono', monospace",
      gap: 20,
    }}>
      {/* Terminal box */}
      <div style={{
        maxWidth: 560, width: "100%", background: "#0a0a0a",
        border: `1px solid ${cancelled ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
        borderRadius: 4, overflow: "hidden",
        transition: "border-color 0.4s",
      }}>
        {/* Title bar */}
        <div style={{
          background: "#0e0e0e", padding: "10px 16px", display: "flex",
          alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {["#ef4444","#f59e0b","#22c55e"].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ flex: 1, textAlign: "center", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>
            roadmap-generator.sh
          </span>
        </div>

        {/* Log output */}
        <div style={{ padding: 24, minHeight: 300 }}>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: 2, color: getColor(line) }}
            >
              {line}
            </motion.div>
          ))}

          {/* Cycling wait message */}
          {animDone && !done && !cancelled && (
            <motion.div
              key={`wait-${waitIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: 2, color: "rgba(245,158,11,0.55)" }}
            >
              {WAITING_MSGS[waitIdx]}
            </motion.div>
          )}

          {/* Blinking cursor — hide after terminal is resolved */}
          {!done && !cancelled && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ display: "inline-block", width: 8, height: 14, background: "#f59e0b", marginTop: 8 }}
            />
          )}
        </div>
      </div>

      {/* Cancel button — below the terminal box, hidden once resolved */}
      {!done && !cancelled && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={onCancel}
          style={{
            padding: "10px 32px",
            background: "transparent",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: 2,
            color: "rgba(239,68,68,0.7)",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.14em",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor  = "rgba(239,68,68,0.8)";
            e.currentTarget.style.color        = "#ef4444";
            e.currentTarget.style.background   = "rgba(239,68,68,0.06)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor  = "rgba(239,68,68,0.35)";
            e.currentTarget.style.color        = "rgba(239,68,68,0.7)";
            e.currentTarget.style.background   = "transparent";
          }}
        >
          CANCEL GENERATION
        </motion.button>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Generate() {
  const navigate = useNavigate();

  const getSaved = () => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };
  const saved = getSaved();

  const [form, setForm]         = useState(saved?.form || { role: "", level: "", time: "", duration: "" });
  const [loading, setLoading]   = useState(saved?.loading || false);
  const [done, setDone]         = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError]       = useState("");

  // Holds the AbortController for the in-flight request
  const abortCtrlRef = useRef(null);
  // Holds the roadmap ID if the API responded before cancel was clicked
  const roadmapIdRef = useRef(null);

  const loadingRef = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Block browser refresh / tab close during generation
  useEffect(() => {
    const handler = (e) => {
      if (!loadingRef.current) return;
      e.preventDefault();
      e.returnValue = "Roadmap is still generating. Are you sure you want to leave?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Block in-app back/forward during generation
  useEffect(() => {
    window.history.pushState({ sentinel: true }, "");
    const handlePop = () => {
      if (!loadingRef.current) return;
      window.history.pushState({ sentinel: true }, "");
      const confirmed = window.confirm("Roadmap is still generating. Are you sure you want to leave?");
      if (confirmed) {
        sessionStorage.removeItem(SESSION_KEY);
        window.history.go(-2);
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  // Persist state
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ form, loading }));
    } catch {}
  }, [form, loading]);

  // ── Cancel handler ──────────────────────────────────────────────────────────
  const handleCancel = async () => {
    // 1. Abort the in-flight HTTP request
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }

    // 2. If the API already returned a roadmap ID before we cancelled, delete it
    if (roadmapIdRef.current) {
      try {
        await axios.delete(`/api/roadmap/${roadmapIdRef.current}`);
      } catch (_) {
        // Best-effort — don't block UX if delete fails
      }
    }

    // 3. Show cancelled state in terminal, then return to form after brief pause
    setCancelled(true);
    setLoading(false);
    sessionStorage.removeItem(SESSION_KEY);

    setTimeout(() => {
      setCancelled(false);
      // loading is already false so terminal unmounts and form shows with inputs intact
    }, 2000);
  };

  // ── Shared generate logic ───────────────────────────────────────────────────
  const runGenerate = async (payload) => {
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;
    roadmapIdRef.current = null;

    const res = await axios.post("/api/roadmap/generate", payload, {
      signal: ctrl.signal,
    });

    if (!res.data.id) throw new Error("No roadmap ID");

    // Store ID in case cancel arrives just after response
    roadmapIdRef.current = res.data.id;

    // If user already cancelled by the time response arrived, delete & bail
    if (ctrl.signal.aborted) {
      try { await axios.delete(`/api/roadmap/${res.data.id}`); } catch (_) {}
      return null;
    }

    return res.data.id;
  };

  // ── Retry on reload ─────────────────────────────────────────────────────────
  const didRetry = useRef(false);
  useEffect(() => {
    if (saved?.loading && saved?.form?.role && !didRetry.current) {
      didRetry.current = true;
      setLoading(true);
      (async () => {
        try {
          const id = await runGenerate({
            role: saved.form.role, level: saved.form.level,
            timePerDay: saved.form.time, duration: saved.form.duration,
          });
          if (id === null) return; // was cancelled
          sessionStorage.removeItem(SESSION_KEY);
          setDone(true);
          setTimeout(() => navigate(`/roadmap/${id}`), 1400);
        } catch (err) {
          if (axios.isCancel?.(err) || err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
          setError(err.response?.data?.message || err.message || "Generation failed.");
          setLoading(false);
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role.trim()) return setError("Please enter a target role");
    if (!form.level)       return setError("Please select experience level");
    if (!form.time)        return setError("Please select daily study time");
    setError("");
    setLoading(true);
    try {
      const id = await runGenerate({
        role: form.role, level: form.level,
        timePerDay: form.time, duration: form.duration,
      });
      if (id === null) return; // was cancelled
      sessionStorage.removeItem(SESSION_KEY);
      setDone(true);
      setTimeout(() => navigate(`/roadmap/${id}`), 1400);
    } catch (err) {
      if (axios.isCancel?.(err) || err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      setError(err.response?.data?.message || err.message || "Generation failed.");
      setLoading(false);
    }
  };

  if (loading || cancelled) {
    return (
      <LoadingTerminal
        role={form.role}
        done={done}
        cancelled={cancelled}
        onCancel={handleCancel}
      />
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 2, color: "#e8e8e8",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13, outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 50% { opacity: 0; } }
        .gen-root { min-height:100vh; background:#080808; font-family:'IBM Plex Mono',monospace; padding:calc(var(--navbar-height,56px) + 60px) 40px 80px; position:relative; overflow-x:hidden; }
        .gen-grid { position:fixed; inset:0; opacity:0.03; pointer-events:none; background-image:linear-gradient(rgba(245,158,11,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.5) 1px,transparent 1px); background-size:80px 80px; }
        .pill-option { padding:9px 16px; border:1px solid rgba(255,255,255,0.09); border-radius:2px; color:rgba(232,232,232,0.45); font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.06em; cursor:pointer; background:rgba(255,255,255,0.02); transition:all 0.15s; white-space:nowrap; }
        .pill-option:hover { border-color:rgba(245,158,11,0.3); color:#f59e0b; background:rgba(245,158,11,0.04); }
        .pill-option.sel { border-color:rgba(245,158,11,0.6); color:#f59e0b; background:rgba(245,158,11,0.08); }
        .gen-input:focus { border-color:rgba(245,158,11,0.5) !important; box-shadow:0 0 0 2px rgba(245,158,11,0.08) !important; }
        .gen-input::placeholder { color:rgba(232,232,232,0.15); }
        .gen-btn { padding:14px 40px; background:#f59e0b; color:#080808; font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:700; letter-spacing:0.16em; border:none; cursor:pointer; border-radius:2px; transition:all 0.2s; }
        .gen-btn:hover:not(:disabled) { background:#fbbf24; transform:translateY(-2px); box-shadow:0 12px 40px rgba(245,158,11,0.4); }
        .gen-btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>

      <div className="gen-root">
        <div className="gen-grid" />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", display: "inline-block", animation: "blink 2s infinite" }} />
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "#f59e0b" }}>ROADMAP GENERATOR</span>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,7vw,88px)", lineHeight: 0.9, letterSpacing: "0.02em", textTransform: "uppercase" }}>
              BUILD YOUR<br />
              <span style={{ WebkitTextFillColor: "transparent", WebkitTextStroke: "1.5px rgba(245,158,11,0.6)" }}>LEARNING PATH</span>
            </h1>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40 }}>

              {/* LEFT */}
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

                {/* 01 Role */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "rgba(245,158,11,0.2)", lineHeight: 1 }}>01</span>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#f59e0b", marginBottom: 2 }}>TARGET ROLE</div>
                      <div style={{ fontSize: 12, color: "rgba(232,232,232,0.4)" }}>What position are you aiming for?</div>
                    </div>
                  </div>
                  <input className="gen-input" style={inputStyle} type="text"
                    placeholder="e.g. Frontend Developer, Data Scientist..."
                    value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {ROLES.map(r => (
                      <button key={r} type="button" className={`pill-option${form.role === r ? " sel" : ""}`}
                        onClick={() => setForm({ ...form, role: r })}>{r}</button>
                    ))}
                  </div>
                </motion.div>

                {/* 02 Level */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "rgba(245,158,11,0.2)", lineHeight: 1 }}>02</span>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#f59e0b", marginBottom: 2 }}>EXPERIENCE LEVEL</div>
                      <div style={{ fontSize: 12, color: "rgba(232,232,232,0.4)" }}>Be honest — it helps tailor the plan.</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { val: "Beginner",     icon: "🌱", desc: "Just starting out"  },
                      { val: "Intermediate", icon: "⚡", desc: "Some experience"    },
                      { val: "Advanced",     icon: "🔥", desc: "Want to specialise" },
                    ].map(l => (
                      <button key={l.val} type="button" onClick={() => setForm({ ...form, level: l.val })}
                        style={{
                          flex: 1, padding: "16px 12px", borderRadius: 2, cursor: "pointer",
                          textAlign: "center", transition: "all 0.15s",
                          border: `1px solid ${form.level === l.val ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.08)"}`,
                          background: form.level === l.val ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                        }}>
                        <div style={{ fontSize: 18, marginBottom: 6 }}>{l.icon}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.1em", fontWeight: 600, color: form.level === l.val ? "#f59e0b" : "rgba(232,232,232,0.5)" }}>{l.val.toUpperCase()}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "rgba(232,232,232,0.3)", marginTop: 2 }}>{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* 03 + 04 */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "rgba(245,158,11,0.2)", lineHeight: 1 }}>03</span>
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#f59e0b", marginBottom: 2 }}>DAILY TIME</div>
                          <div style={{ fontSize: 12, color: "rgba(232,232,232,0.4)" }}>Hours available per day</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {TIMES.map(t => (
                          <button key={t} type="button" className={`pill-option${form.time === t ? " sel" : ""}`}
                            onClick={() => setForm({ ...form, time: t })}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "rgba(245,158,11,0.2)", lineHeight: 1 }}>04</span>
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "#f59e0b", marginBottom: 2 }}>DURATION</div>
                          <div style={{ fontSize: 12, color: "rgba(232,232,232,0.4)" }}>Target completion timeline</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {DURATIONS.map(d => (
                          <button key={d} type="button" className={`pill-option${form.duration === d ? " sel" : ""}`}
                            onClick={() => setForm({ ...form, duration: d })}>{d}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 2, fontSize: 12, color: "#fca5a5" }}>
                    ✕ {error}
                  </div>
                )}

                <button type="submit" className="gen-btn">GENERATE MY ROADMAP →</button>
              </div>

              {/* RIGHT: Live preview */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                style={{ position: "sticky", top: 90, alignSelf: "start" }}>
                <div style={{ border: "1px solid rgba(245,158,11,0.15)", borderRadius: 4, overflow: "hidden", background: "#0a0a0a" }}>
                  <div style={{ background: "#0e0e0e", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                    {["#ef4444","#f59e0b","#22c55e"].map((c, i) => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c, opacity: 0.6 }} />
                    ))}
                    <span style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)" }}>preview.json</span>
                  </div>
                  <div style={{ padding: 20, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>
                    {[
                      { k: "role",     v: form.role     || '""',               color: form.role     ? "#60a5fa" : "rgba(255,255,255,0.2)" },
                      { k: "level",    v: form.level    ? `"${form.level}"`    : '""', color: form.level    ? "#34d399" : "rgba(255,255,255,0.2)" },
                      { k: "time",     v: form.time     ? `"${form.time}/day"` : '""', color: form.time     ? "#c084fc" : "rgba(255,255,255,0.2)" },
                      { k: "duration", v: form.duration ? `"${form.duration}"` : '""', color: form.duration ? "#fbbf24" : "rgba(255,255,255,0.2)" },
                      { k: "status",   v: form.role && form.level && form.time ? '"READY"' : '"PENDING"', color: form.role && form.level && form.time ? "#f59e0b" : "rgba(255,255,255,0.2)" },
                    ].map((l, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                        <span style={{ color: "rgba(245,158,11,0.5)", minWidth: 60 }}>{l.k}:</span>
                        <span style={{ color: l.color, transition: "color 0.3s" }}>{l.v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>READINESS</div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 1, background: "#f59e0b", transition: "width 0.4s",
                          width: `${[form.role, form.level, form.time, form.duration].filter(Boolean).length * 25}%`,
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 6 }}>
                        {[form.role, form.level, form.time, form.duration].filter(Boolean).length}/4 fields complete
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}