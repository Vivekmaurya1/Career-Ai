// src/pages/generate.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { motion } from "framer-motion";

const ROLES     = ["Frontend Developer","Backend Developer","Full Stack Engineer","Data Scientist","ML Engineer","DevOps Engineer","Mobile Developer","Product Manager","UI/UX Designer","Cloud Architect"];
const TIMES     = ["30 min","1 hour","2 hours","3 hours","4+ hours"];
const DURATIONS = ["1 month","2 months","3 months","6 months","12 months"];
const EXP_YEARS = ["0–1 years","1–3 years","3–5 years","5–10 years","10+ years"];
const SESSION_KEY = "roadmap_generation_state";

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

  useEffect(() => {
    if (!animDone || done || cancelled) return;
    const interval = setInterval(() => {
      setWaitIdx(prev => (prev + 1) % WAITING_MSGS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [animDone, done, cancelled]);

  useEffect(() => {
    if (done)      setLines(prev => [...prev, "> ✓ Complete. Redirecting..."]);
    if (cancelled) setLines(prev => [...prev, "> ✕ Generation cancelled."]);
  }, [done, cancelled]);

  const getColor = (line) => {
    if (typeof line !== "string") return "var(--text-muted)";
    if (line.includes("✓"))      return "var(--success)";
    if (line.includes("✕"))      return "var(--danger)";
    if (line.includes("Analyzing")) return "var(--accent)";
    return "var(--text-muted)";
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "calc(var(--navbar-height,56px) + 40px) 20px 40px",
      fontFamily: "'IBM Plex Mono', monospace",
      gap: 20, transition: "background 0.4s ease",
    }}>
      <div style={{
        maxWidth: 560, width: "100%", background: "var(--bg-surface)",
        border: `1px solid ${cancelled ? "var(--danger-border)" : "var(--accent-border)"}`,
        borderRadius: 4, overflow: "hidden",
        transition: "border-color 0.4s",
      }}>
        <div style={{
          background: "var(--bg-raised)", padding: "10px 16px", display: "flex",
          alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)",
        }}>
          {["#ef4444","var(--accent)","#22c55e"].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ flex: 1, textAlign: "center", fontSize: 10, letterSpacing: "0.1em", color: "var(--text-dim)" }}>
            roadmap-generator.sh
          </span>
        </div>

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

          {animDone && !done && !cancelled && (
            <motion.div
              key={`wait-${waitIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: 2, color: "var(--accent-border)" }}
            >
              {WAITING_MSGS[waitIdx]}
            </motion.div>
          )}

          {!done && !cancelled && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ display: "inline-block", width: 8, height: 14, background: "var(--accent)", marginTop: 8 }}
            />
          )}
        </div>
      </div>

      {!done && !cancelled && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={onCancel}
          style={{
            padding: "10px 32px", background: "transparent",
            border: "1px solid var(--danger-border)", borderRadius: 2,
            color: "var(--danger)", fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, letterSpacing: "0.14em", cursor: "pointer",
            transition: "all 0.2s", opacity: 0.7,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "var(--danger-bg)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "0.7"; e.currentTarget.style.background = "transparent"; }}
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
    try { const raw = sessionStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  };
  const saved = getSaved();

  // ── form state now includes yearsOfExperience ──
  const [form, setForm] = useState(
    saved?.form || { role: "", level: "", yearsOfExperience: "", time: "", duration: "" }
  );
  const [loading, setLoading]     = useState(saved?.loading || false);
  const [done, setDone]           = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError]         = useState("");

  const abortCtrlRef = useRef(null);
  const roadmapIdRef = useRef(null);
  const loadingRef   = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

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

  useEffect(() => {
    window.history.pushState({ sentinel: true }, "");
    const handlePop = () => {
      if (!loadingRef.current) return;
      window.history.pushState({ sentinel: true }, "");
      const confirmed = window.confirm("Roadmap is still generating. Are you sure you want to leave?");
      if (confirmed) { sessionStorage.removeItem(SESSION_KEY); window.history.go(-2); }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ form, loading })); } catch {}
  }, [form, loading]);

  const handleCancel = async () => {
    if (abortCtrlRef.current) abortCtrlRef.current.abort();
    if (roadmapIdRef.current) {
      try { await axios.delete(`/api/roadmap/${roadmapIdRef.current}`); } catch (_) {}
    }
    setCancelled(true);
    setLoading(false);
    sessionStorage.removeItem(SESSION_KEY);
    setTimeout(() => { setCancelled(false); }, 2000);
  };

  const runGenerate = async (payload) => {
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;
    roadmapIdRef.current = null;
    const res = await axios.post("/api/roadmap/generate", payload, { signal: ctrl.signal });
    if (!res.data.id) throw new Error("No roadmap ID");
    roadmapIdRef.current = res.data.id;
    if (ctrl.signal.aborted) {
      try { await axios.delete(`/api/roadmap/${res.data.id}`); } catch (_) {}
      return null;
    }
    return res.data.id;
  };

  const didRetry = useRef(false);
  useEffect(() => {
    if (saved?.loading && saved?.form?.role && !didRetry.current) {
      didRetry.current = true;
      setLoading(true);
      (async () => {
        try {
          const id = await runGenerate({
            role: saved.form.role,
            level: saved.form.level,
            yearsOfExperience: saved.form.yearsOfExperience,
            timePerDay: saved.form.time,
            duration: saved.form.duration,
          });
          if (id === null) return;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role.trim())  return setError("Please enter a target role");
    if (!form.level)        return setError("Please select experience level");
    if (!form.yearsOfExperience) return setError("Please select years of experience");
    if (!form.time)         return setError("Please select daily study time");
    setError("");
    setLoading(true);
    try {
      const id = await runGenerate({
        role: form.role,
        level: form.level,
        yearsOfExperience: form.yearsOfExperience,
        timePerDay: form.time,
        duration: form.duration,
      });
      if (id === null) return;
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

  // readiness = 5 fields now
  const filledCount = [form.role, form.level, form.yearsOfExperience, form.time, form.duration].filter(Boolean).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        @keyframes blink { 50% { opacity: 0; } }
        .gen-root {
          min-height:100vh; background: var(--bg);
          font-family:'IBM Plex Mono',monospace;
          padding:calc(var(--navbar-height,56px) + 60px) 40px 80px;
          position:relative; overflow-x:hidden;
          color: var(--text);
          transition: background 0.4s ease, color 0.3s ease;
        }
        .gen-grid {
          position:fixed; inset:0; opacity: var(--grid-opacity, 0.03); pointer-events:none;
          background-image: linear-gradient(var(--grid-color) 1px,transparent 1px),
                            linear-gradient(90deg,var(--grid-color) 1px,transparent 1px);
          background-size:80px 80px;
        }
        .pill-option {
          padding:9px 16px; border:1px solid var(--border); border-radius:2px;
          color: var(--text-muted); font-family:'IBM Plex Mono',monospace;
          font-size:11px; letter-spacing:0.06em; cursor:pointer;
          background: var(--input-bg); transition:all 0.15s; white-space:nowrap;
        }
        .pill-option:hover { border-color: var(--accent-border); color: var(--accent); background: var(--accent-dim); }
        .pill-option.sel   { border-color: var(--border-focus); color: var(--accent); background: var(--accent-dim); }
        .gen-input {
          width:100%; padding:12px 16px;
          background: var(--input-bg);
          border:1px solid var(--input-border);
          border-radius:2px; color: var(--text);
          font-family:'IBM Plex Mono',monospace;
          font-size:13px; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .gen-input:focus {
          border-color: var(--border-focus) !important;
          box-shadow: var(--input-focus-shadow) !important;
          background: var(--input-focus-bg) !important;
        }
        .gen-input::placeholder { color: var(--text-faint); }
        .gen-btn {
          padding:14px 40px; background: var(--accent); color: var(--bg);
          font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:700;
          letter-spacing:0.16em; border:none; cursor:pointer; border-radius:2px;
          transition:all 0.2s;
        }
        .gen-btn:hover:not(:disabled) { background: var(--accent-bright); transform:translateY(-2px); box-shadow:0 12px 40px var(--accent-glow); }
        .gen-btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>

      <div className="gen-root">
        <div className="gen-grid" />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "blink 2s infinite" }} />
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--accent)" }}>ROADMAP GENERATOR</span>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,7vw,88px)", lineHeight: 0.9, letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--text-heading)" }}>
              BUILD YOUR<br />
              <span style={{ WebkitTextFillColor: "transparent", WebkitTextStroke: "1.5px var(--accent-border)" }}>LEARNING PATH</span>
            </h1>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40 }}>

              {/* LEFT */}
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

                {/* 01 — Role */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--accent-dim)", lineHeight: 1 }}>01</span>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--accent)", marginBottom: 2 }}>TARGET ROLE</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>What position are you aiming for?</div>
                    </div>
                  </div>
                  <input className="gen-input" type="text"
                    placeholder="e.g. Frontend Developer, Data Scientist..."
                    value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {ROLES.map(r => (
                      <button key={r} type="button" className={`pill-option${form.role === r ? " sel" : ""}`}
                        onClick={() => setForm({ ...form, role: r })}>{r}</button>
                    ))}
                  </div>
                </motion.div>

                {/* 02 — Experience Level */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--accent-dim)", lineHeight: 1 }}>02</span>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--accent)", marginBottom: 2 }}>EXPERIENCE LEVEL</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Be honest — it helps tailor the plan.</div>
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
                          border: `1px solid ${form.level === l.val ? "var(--border-focus)" : "var(--border)"}`,
                          background: form.level === l.val ? "var(--accent-dim)" : "var(--input-bg)",
                        }}>
                        <div style={{ fontSize: 18, marginBottom: 6 }}>{l.icon}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.1em", fontWeight: 600, color: form.level === l.val ? "var(--accent)" : "var(--text-muted)" }}>{l.val.toUpperCase()}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* 03 — Years of Experience (NEW) */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--accent-dim)", lineHeight: 1 }}>03</span>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--accent)", marginBottom: 2 }}>YEARS OF EXPERIENCE</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>How long have you been in the field?</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {EXP_YEARS.map(exp => (
                      <button key={exp} type="button"
                        onClick={() => setForm({ ...form, yearsOfExperience: exp })}
                        style={{
                          padding: "14px 20px", borderRadius: 2, cursor: "pointer",
                          textAlign: "center", transition: "all 0.15s", flex: "1 1 calc(20% - 8px)", minWidth: 100,
                          border: `1px solid ${form.yearsOfExperience === exp ? "var(--border-focus)" : "var(--border)"}`,
                          background: form.yearsOfExperience === exp ? "var(--accent-dim)" : "var(--input-bg)",
                        }}>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: form.yearsOfExperience === exp ? "var(--accent)" : "var(--text-muted)" }}>
                          {exp}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* 04 & 05 — Daily Time + Duration */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--accent-dim)", lineHeight: 1 }}>04</span>
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--accent)", marginBottom: 2 }}>DAILY TIME</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Hours available per day</div>
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
                        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--accent-dim)", lineHeight: 1 }}>05</span>
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--accent)", marginBottom: 2 }}>DURATION</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Target completion timeline</div>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 2, fontSize: 12, color: "var(--danger)" }}>
                    ✕ {error}
                  </div>
                )}

                <button type="submit" className="gen-btn">GENERATE MY ROADMAP →</button>
              </div>

              {/* RIGHT — Live preview */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                style={{ position: "sticky", top: 90, alignSelf: "start" }}>
                <div style={{ border: "1px solid var(--accent-dim)", borderRadius: 4, overflow: "hidden", background: "var(--bg-surface)" }}>
                  <div style={{ background: "var(--bg-raised)", padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                    {["#ef4444","var(--accent)","#22c55e"].map((c, i) => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c, opacity: 0.6 }} />
                    ))}
                    <span style={{ fontSize: 9, letterSpacing: "0.1em", color: "var(--text-dim)" }}>preview.json</span>
                  </div>
                  <div style={{ padding: 20, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>
                    {[
                      { k: "role",       v: form.role             || '""', color: form.role             ? "var(--info)"         : "var(--text-faint)" },
                      { k: "level",      v: form.level            ? `"${form.level}"`            : '""', color: form.level            ? "var(--success)"     : "var(--text-faint)" },
                      { k: "experience", v: form.yearsOfExperience ? `"${form.yearsOfExperience}"` : '""', color: form.yearsOfExperience ? "var(--purple)"      : "var(--text-faint)" },
                      { k: "time",       v: form.time             ? `"${form.time}/day"`         : '""', color: form.time             ? "var(--accent)"      : "var(--text-faint)" },
                      { k: "duration",   v: form.duration         ? `"${form.duration}"`         : '""', color: form.duration         ? "var(--accent-bright)": "var(--text-faint)" },
                      { k: "status",     v: form.role && form.level && form.yearsOfExperience && form.time ? '"READY"' : '"PENDING"',
                        color: form.role && form.level && form.yearsOfExperience && form.time ? "var(--accent)" : "var(--text-faint)" },
                    ].map((l, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                        <span style={{ color: "var(--accent-border)", minWidth: 68 }}>{l.k}:</span>
                        <span style={{ color: l.color, transition: "color 0.3s" }}>{l.v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--text-dim)", marginBottom: 8 }}>READINESS</div>
                      <div style={{ height: 3, background: "var(--border)", borderRadius: 1, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 1, background: "var(--accent)", transition: "width 0.4s",
                          width: `${filledCount * 20}%`,
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 6 }}>
                        {filledCount}/5 fields complete
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