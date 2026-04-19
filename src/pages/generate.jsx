// pages/Generate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateRoadmap } from "../api/roadmapApi";

const ROLES = [
  "Frontend Engineer", "Backend Engineer", "Full Stack",
  "Data Scientist", "ML Engineer", "DevOps Engineer",
  "iOS Developer", "Cloud Architect",
];

const LEVELS = [
  { val: "Beginner",     icon: "◎", desc: "0–1 year experience"   },
  { val: "Intermediate", icon: "◈", desc: "1–3 years experience"  },
  { val: "Advanced",     icon: "★", desc: "3+ years experience"   },
];

const EXP_YEARS = ["< 6 months", "6–12 months", "1–2 years", "2–4 years", "4–7 years", "7+ years"];
const TIMES     = ["30 min", "1 hr", "2 hrs", "3 hrs", "4+ hrs"];
const DURATIONS = ["4 weeks", "6 weeks", "8 weeks", "10 weeks", "3 months", "6 months"];

function FieldHeader({ num, label, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--a)", marginBottom: 6 }}>
        STEP {num}
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--t1)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--t2)", fontWeight: 400 }}>{hint}</div>
    </div>
  );
}

export default function Generate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: "", level: "", yearsOfExperience: "", time: "", duration: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filledCount = Object.values(form).filter(Boolean).length;
  const pct = (filledCount / 5) * 100;

  const handleSubmit = async () => {
    if (!form.role.trim()) return setError("Please enter a target role");
    if (!form.level)       return setError("Please select experience level");
    if (!form.time)        return setError("Please select daily study time");
    
    setError("");
    setLoading(true);
    
    try {
      const roadmapData = {
        role: form.role,
        level: form.level,
        yearsOfExperience: form.yearsOfExperience || null,
        dailyTime: form.time,
        duration: form.duration || null,
      };
      
      const result = await generateRoadmap(roadmapData);
      
      // Navigate to roadmap page with the generated roadmap
      if (result.id) {
        navigate(`/roadmap/${result.id}`);
      } else {
        setError("Failed to generate roadmap. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error generating roadmap:", err);
      setError(err.response?.data?.message || "An error occurred while generating your roadmap. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 20px 40px" }}>
        <style>{`@keyframes terminal-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

        <div style={{ maxWidth: 560, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--a)", boxShadow: "0 0 12px var(--a)", animation: "blink 1.5s ease-in-out infinite" }}/>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.22em", color: "var(--a)" }}>PROCESSING</span>
          </div>

          <div style={{ background: "rgba(0,0,0,0.6)", border: "1px solid var(--brd)", borderRadius: "12px", overflow: "hidden", backdropFilter: "blur(24px)" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--brd)" }}>
              {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }}/>
              ))}
              <span style={{ flex: 1, textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--t3)" }}>roadmap-generator.sh</span>
            </div>

            <div style={{ padding: "28px 28px 32px", minHeight: 240, fontFamily: "'DM Mono', monospace", fontSize: 12, lineHeight: 2.1, color: "var(--t2)" }}>
              {[
                `> Analyzing role: "${form.role}"`,
                "> Sequencing learning phases...",
                "> Generating milestone projects...",
                "> Building interview prep module...",
                "> Calculating weekly timeline...",
              ].map((line, i) => (
                <div key={i} style={{ color: i === 0 ? "var(--a)" : "var(--t2)", opacity: 0, animation: `fadeIn 0.3s ease ${i * 0.6}s both` }}>
                  {line}
                </div>
              ))}
              <span style={{ display: "inline-block", width: 8, height: 14, background: "var(--a)", marginTop: 6, borderRadius: 1, animation: "terminal-blink 1s ease-in-out infinite" }}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .gen-root {
          min-height: 100vh;
          background: var(--bg);
          padding: 100px clamp(20px, 4vw, 64px) 100px;
          position: relative;
        }

        .gen-inner {
          max-width: 980px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .gen-header {
          margin-bottom: 64px;
        }

        .gen-headline {
          font-size: clamp(2.8rem, 6vw, 5.5rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 0.94;
          color: var(--t1);
        }

        .gen-headline-accent {
          background: linear-gradient(135deg, var(--a), #d0ff5c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gen-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 48px;
        }

        .gen-fields {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .gen-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--brd), transparent);
        }

        /* Role input */
        .gen-role-input {
          width: 100%;
          height: 52px;
          padding: 0 18px;
          background: var(--bg-1);
          border: 1px solid var(--brd);
          border-radius: 8px;
          color: var(--t1);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 12px;
        }

        .gen-role-input:focus {
          border-color: var(--a-brd);
          box-shadow: 0 0 0 3px var(--a-glow);
        }

        .gen-role-input::placeholder {
          color: var(--t3);
        }

        /* Role pills */
        .gen-role-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .gen-role-pill {
          padding: 6px 13px;
          background: var(--srf);
          border: 1px solid var(--brd);
          border-radius: 99px;
          color: var(--t2);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .gen-role-pill:hover,
        .gen-role-pill.sel {
          background: var(--a-dim);
          border-color: var(--a-brd);
          color: var(--a);
        }

        /* Level cards */
        .gen-levels {
          display: flex;
          gap: 10px;
        }

        .gen-level-card {
          flex: 1;
          padding: 18px 14px;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          border: 1px solid var(--brd);
          background: var(--srf);
          position: relative;
          overflow: hidden;
        }

        .gen-level-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.2s;
          background: radial-gradient(ellipse at 50% 0%, var(--a-dim), transparent 70%);
        }

        .gen-level-card:hover {
          border-color: var(--brd-hi);
          transform: translateY(-2px);
        }

        .gen-level-card:hover::before {
          opacity: 0.5;
        }

        .gen-level-card.sel {
          border-color: var(--a-brd);
          background: var(--a-dim);
        }

        .gen-level-card.sel::before {
          opacity: 1;
        }

        .gen-level-icon {
          font-size: 22px;
          margin-bottom: 8px;
        }

        .gen-level-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
          transition: color 0.2s;
        }

        .gen-level-desc {
          font-size: 10px;
          color: var(--t3);
        }

        /* Exp year cards */
        .gen-exp-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .gen-exp-card {
          padding: 12px 14px;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid var(--brd);
          background: var(--srf);
          flex: 1 1 calc(16% - 8px);
          min-width: 80px;
          text-align: center;
          transition: all 0.2s;
        }

        .gen-exp-card:hover {
          border-color: var(--brd-hi);
          transform: translateY(-1px);
        }

        .gen-exp-card.sel {
          border-color: var(--a-brd);
          background: var(--a-dim);
        }

        .gen-exp-val {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          color: var(--t2);
          transition: color 0.2s;
        }

        .gen-exp-card.sel .gen-exp-val {
          color: var(--a);
        }

        /* Time/Duration pills */
        .gen-time-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .gen-time-pill {
          padding: 9px 15px;
          border-radius: 8px;
          border: 1px solid var(--brd);
          background: var(--srf);
          color: var(--t2);
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .gen-time-pill:hover {
          border-color: var(--brd-hi);
          color: var(--t1);
        }

        .gen-time-pill.sel {
          background: var(--a-dim);
          border-color: var(--a-brd);
          color: var(--a);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        /* Submit */
        .gen-submit {
          width: 100%;
          height: 56px;
          background: var(--a);
          color: #07080b;
          font-family: inherit;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 0.02em;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .gen-submit:hover:not(:disabled) {
          background: #d0ff5c;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }

        .gen-submit:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* Live preview sidebar */
        .gen-preview {
          background: var(--bg-1);
          border: 1px solid var(--brd);
          border-radius: 12px;
          overflow: hidden;
          position: sticky;
          top: 100px;
          align-self: start;
        }

        .gen-preview-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--brd);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.02);
        }

        .gen-preview-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--t3);
        }

        .gen-preview-status {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          padding: 3px 10px;
          border-radius: 20px;
          transition: all 0.4s;
        }

        .gen-preview-fields {
          padding: 18px 20px 10px;
        }

        .gen-preview-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .gen-preview-field:last-child {
          border-bottom: none;
        }

        .gen-preview-key {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--t3);
        }

        .gen-preview-val {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          max-width: 150px;
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.3s;
        }

        .gen-preview-progress {
          padding: 16px 20px 20px;
        }

        .gen-preview-progress-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-family: 'DM Mono', monospace;
        }

        .gen-preview-steps {
          display: flex;
          gap: 5px;
          margin-top: 10px;
        }

        @media (max-width: 800px) {
          .gen-layout {
            grid-template-columns: 1fr;
          }

          .gen-preview {
            position: static;
          }

          .gen-levels {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="gen-root">
        <div className="bg-grid"/>

        <div className="gen-inner">
          {/* Header */}
          <div className="gen-header">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--srf)", border: "1px solid var(--brd)", borderRadius: 99, marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--a)", boxShadow: "0 0 8px var(--a)", animation: "blink 2s ease-out infinite" }}/>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.2em", color: "var(--a)" }}>ROADMAP GENERATOR</span>
            </div>

            <h1 className="gen-headline">
              Build Your<br/>
              <span className="gen-headline-accent">Learning Path</span>
            </h1>
            <p style={{ marginTop: 14, fontSize: 15, color: "var(--t2)", fontWeight: 400, maxWidth: 440 }}>
              Answer a few questions and we'll generate a personalized curriculum tailored to your goals.
            </p>
          </div>

          <div className="gen-layout">
            {/* Fields */}
            <div className="gen-fields">

              {/* 01 Role */}
              <div>
                <FieldHeader num="01" label="Target Role" hint="What position are you aiming for?"/>
                <input
                  className="gen-role-input"
                  placeholder="e.g. Frontend Developer, Data Scientist…"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                />
                <div className="gen-role-pills">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      className={`gen-role-pill${form.role === r ? " sel" : ""}`}
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="gen-divider"/>

              {/* 02 Level */}
              <div>
                <FieldHeader num="02" label="Experience Level" hint="Be honest — it helps tailor the plan."/>
                <div className="gen-levels">
                  {LEVELS.map(l => (
                    <button
                      key={l.val}
                      className={`gen-level-card${form.level === l.val ? " sel" : ""}`}
                      onClick={() => setForm(f => ({ ...f, level: l.val }))}
                    >
                      <div className="gen-level-icon" style={{ filter: form.level === l.val ? "none" : "grayscale(0.5)" }}>
                        {l.icon}
                      </div>
                      <div className="gen-level-label" style={{ color: form.level === l.val ? "var(--a)" : "var(--t2)" }}>
                        {l.val.toUpperCase()}
                      </div>
                      <div className="gen-level-desc">{l.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="gen-divider"/>

              {/* 03 Exp years */}
              <div>
                <FieldHeader num="03" label="Years of Experience" hint="How long have you been in the field?"/>
                <div className="gen-exp-grid">
                  {EXP_YEARS.map(exp => (
                    <button
                      key={exp}
                      className={`gen-exp-card${form.yearsOfExperience === exp ? " sel" : ""}`}
                      onClick={() => setForm(f => ({ ...f, yearsOfExperience: exp }))}
                    >
                      <div className="gen-exp-val">{exp}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="gen-divider"/>

              {/* 04 + 05 Time + Duration */}
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                  <div>
                    <FieldHeader num="04" label="Daily Time" hint="Hours available per day"/>
                    <div className="gen-time-pills">
                      {TIMES.map(t => (
                        <button
                          key={t}
                          className={`gen-time-pill${form.time === t ? " sel" : ""}`}
                          onClick={() => setForm(f => ({ ...f, time: t }))}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldHeader num="05" label="Duration" hint="Target completion timeline"/>
                    <div className="gen-time-pills">
                      {DURATIONS.map(d => (
                        <button
                          key={d}
                          className={`gen-time-pill${form.duration === d ? " sel" : ""}`}
                          onClick={() => setForm(f => ({ ...f, duration: d }))}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: "12px 16px", background: "var(--error-bg)", border: "1px solid var(--error-brd)", borderRadius: "8px", fontSize: 13, color: "var(--error)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>⚠</span> {error}
                </div>
              )}

              {/* Submit */}
              <button className="gen-submit" onClick={handleSubmit} disabled={filledCount < 4}>
                GENERATE MY ROADMAP
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {filledCount < 4 && (
                <p style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--t3)", marginTop: -20 }}>
                  Complete {4 - filledCount} more field{4 - filledCount !== 1 ? "s" : ""} to continue
                </p>
              )}
            </div>

            {/* Preview sidebar */}
            <div className="gen-preview">
              <div className="gen-preview-header">
                <div className="gen-preview-label">
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: filledCount >= 4 ? "var(--success)" : "var(--border)", transition: "background 0.4s", boxShadow: filledCount >= 4 ? "0 0 10px rgba(74,222,128,0.35)" : "none" }}/>
                  LIVE PREVIEW
                </div>
                <div className="gen-preview-status" style={{ background: filledCount >= 4 ? "var(--success-bg)" : "rgba(255,255,255,0.04)", color: filledCount >= 4 ? "var(--success)" : "var(--text-04)", border: `1px solid ${filledCount >= 4 ? "var(--success-border)" : "var(--border)"}` }}>
                  {filledCount >= 4 ? "READY" : "PENDING"}
                </div>
              </div>

              <div className="gen-preview-fields">
                {[
                  { k: "role",        v: form.role             || "—", color: form.role             ? "var(--t1)" : "rgba(255,255,255,0.2)" },
                  { k: "level",       v: form.level            || "—", color: form.level            ? "var(--a)"  : "rgba(255,255,255,0.2)" },
                  { k: "experience",  v: form.yearsOfExperience || "—", color: form.yearsOfExperience ? "var(--success)"    : "rgba(255,255,255,0.2)" },
                  { k: "time/day",    v: form.time              || "—", color: form.time             ? "var(--a)"  : "rgba(255,255,255,0.2)" },
                  { k: "duration",    v: form.duration          || "—", color: form.duration         ? "var(--a)"  : "rgba(255,255,255,0.2)" },
                ].map(f => (
                  <div key={f.k} className="gen-preview-field">
                    <span className="gen-preview-key">{f.k}</span>
                    <span className="gen-preview-val" style={{ color: f.color }}>{f.v}</span>
                  </div>
                ))}
              </div>

              <div className="gen-preview-progress">
                <div className="gen-preview-progress-top">
                  <span style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--t3)" }}>READINESS</span>
                  <span style={{ fontSize: 9, color: "var(--a)" }}>{filledCount}/5</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: "var(--a)", transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)" }}/>
                </div>
                <div className="gen-preview-steps">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 2, borderRadius: 99, background: i < filledCount ? "var(--a)" : "rgba(255,255,255,0.08)", transition: "background 0.3s" }}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}