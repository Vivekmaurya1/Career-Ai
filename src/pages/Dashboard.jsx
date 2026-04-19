// pages/Dashboard.jsx
import { useState, useEffect } from "react";
import api from "../api/axios";

const LEVEL_COLORS = {
  BEGINNER:     { text: "var(--teal)",   border: "rgba(0,229,200,0.28)",  bg: "rgba(0,229,200,0.06)"  },
  INTERMEDIATE: { text: "var(--accent)", border: "var(--accent-border)",   bg: "var(--accent-dim)"      },
  ADVANCED:     { text: "var(--amber)",  border: "rgba(255,183,0,0.28)",  bg: "rgba(255,183,0,0.06)"  },
};

function RoadmapCard({ roadmap, onOpen, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const lc = LEVEL_COLORS[roadmap.level] || LEVEL_COLORS.INTERMEDIATE;

  return (
    <div
      style={{
        background: "var(--bg-01)",
        border: `1px solid ${hovered ? "var(--border-hi)" : "var(--border)"}`,
        borderRadius: "var(--r-xl)",
        overflow: "hidden",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.5)" : "none",
        transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowConfirm(false); }}
      onClick={() => onOpen?.(roadmap.id)}
    >
      {/* Top accent */}
      <div style={{
        height: 2,
        background: "var(--accent)",
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
      }}/>

      <div style={{ padding: "20px 20px 16px" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em",
              padding: "4px 9px", border: `1px solid ${lc.border}`,
              borderRadius: "var(--r-sm)", background: lc.bg, color: lc.text,
            }}>
              {roadmap.level}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            {hovered && !showConfirm && (
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
                  padding: "4px 8px", border: "1px solid rgba(255,59,85,0.22)",
                  borderRadius: "var(--r-sm)", background: "transparent",
                  color: "rgba(255,59,85,0.7)", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                DEL
              </button>
            )}

            {showConfirm && (
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  onClick={() => { onDelete?.(roadmap.id); setShowConfirm(false); }}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "4px 10px", background: "rgba(255,59,85,0.1)", border: "1px solid rgba(255,59,85,0.3)", borderRadius: "var(--r-sm)", color: "var(--red)", cursor: "pointer" }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "4px 10px", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-04)", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: "clamp(1rem, 1.4vw, 1.15rem)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-00)", lineHeight: 1.2, marginBottom: 4 }}>
          {roadmap.title}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-04)", letterSpacing: "0.08em", marginBottom: 16 }}>
          {roadmap.role}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-04)", letterSpacing: "0.1em" }}>PROGRESS</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", fontWeight: 600 }}>{roadmap.progress ?? 0}%</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${roadmap.progress ?? 0}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.8s ease" }}/>
          </div>
        </div>

        {/* Meta chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[roadmap.timePerDay, roadmap.duration].filter(Boolean).map(m => (
            <span key={m} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-04)", padding: "3px 8px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", letterSpacing: "0.08em" }}>
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "11px 20px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: hovered ? "var(--accent-dim)" : "transparent",
        transition: "background 0.2s",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-04)", letterSpacing: "0.1em" }}>
          {roadmap.createdAt
            ? new Date(roadmap.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—"}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: hovered ? "var(--accent)" : "var(--text-04)", letterSpacing: "0.14em", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
          OPEN
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ transform: hovered ? "translate(2px,-2px)" : "none", transition: "transform 0.2s" }}>
            <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

export default function Dashboard({ user }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [filter,   setFilter]   = useState("ALL");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await api.get("/api/roadmap/user");
        // Attach progress % from progressJson if available, default to 0
        const withProgress = res.data.map(r => ({
          ...r,
          progress: r.progress ?? 0,
        }));
        setRoadmaps(withProgress);
      } catch (err) {
        setError("Failed to load roadmaps. Please try again.");
        console.error("Failed to load roadmaps:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/roadmap/${id}`);
      setRoadmaps(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
    }
  };

  const levels   = ["ALL", ...new Set(roadmaps.map(r => r.level))];
  const filtered = filter === "ALL" ? roadmaps : roadmaps.filter(r => r.level === filter);

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      gap: 12,
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{
        width: 16, height: 16,
        border: "2px solid rgba(255,255,255,0.08)",
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}/>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--text-04)" }}>
        LOADING...
      </span>
    </div>
  );

  return (
    <>
      <style>{`
        .db-root {
          min-height: 100vh;
          background: var(--bg);
          padding: calc(var(--navbar-h) + 48px) clamp(20px, 4vw, 64px) 100px;
          position: relative;
        }

        .db-inner {
          max-width: 1260px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .db-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 52px;
          flex-wrap: wrap;
          gap: 24px;
        }

        .db-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .db-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          animation: blink 2s ease-in-out infinite;
          box-shadow: 0 0 8px var(--accent-glow);
        }

        .db-eyebrow-text {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          color: var(--accent);
          text-transform: uppercase;
        }

        .db-headline {
          font-size: clamp(2.6rem, 5vw, 4.5rem);
          font-weight: 900;
          letter-spacing: -0.05em;
          line-height: 0.92;
          color: var(--text-00);
        }

        .db-headline-accent {
          color: var(--accent);
          text-shadow: 0 0 40px var(--accent-dim);
        }

        .db-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .db-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          overflow: hidden;
          margin-bottom: 48px;
          background: var(--bg-01);
        }

        .db-stat {
          padding: 22px 24px;
          border-right: 1px solid var(--border);
          position: relative;
          transition: background var(--t-fast);
        }

        .db-stat:last-child { border-right: none; }
        .db-stat:first-child::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent);
        }

        .db-stat:hover { background: var(--accent-dim); }

        .db-stat-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-04);
          margin-bottom: 10px;
        }

        .db-stat-val {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--text-00);
          line-height: 1;
        }

        .db-filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .db-filter-title {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .db-filter-count {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          color: var(--text-04);
          text-transform: uppercase;
        }

        .db-filter-pills { display: flex; gap: 5px; }

        .db-filter-pill {
          height: 34px;
          padding: 0 14px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: var(--r-sm);
          color: var(--text-04);
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all var(--t-fast);
        }

        .db-filter-pill:hover { color: var(--text-01); border-color: var(--border-hi); }
        .db-filter-pill.active { color: var(--accent); border-color: var(--accent-border); background: var(--accent-dim); }

        .db-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 12px;
        }

        .db-empty {
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: var(--r-xl);
          padding: 80px 32px;
          text-align: center;
        }

        .db-empty-num {
          font-size: 5rem;
          font-weight: 900;
          letter-spacing: -0.06em;
          color: var(--accent-dim);
          line-height: 1;
          margin-bottom: 20px;
        }

        .db-empty-title {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-00);
          margin-bottom: 10px;
        }

        .db-empty-sub {
          font-size: 14px;
          color: var(--text-03);
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .db-error {
          padding: 12px 16px;
          border: 1px solid rgba(255,59,85,0.22);
          border-left: 3px solid rgba(255,59,85,0.7);
          border-radius: var(--r-md);
          background: rgba(255,59,85,0.06);
          color: rgba(255,59,85,0.9);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          margin-bottom: 32px;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        @media (max-width: 700px) {
          .db-stats { grid-template-columns: repeat(2, 1fr); }
          .db-stat:nth-child(2) { border-right: none; }
          .db-stat:nth-child(-n+2) { border-bottom: 1px solid var(--border); }
        }
      `}</style>

      <div className="db-root">
        <div className="bg-grid"/>

        <div className="db-inner">

          {/* Header */}
          <div className="db-header">
            <div>
              <div className="db-eyebrow">
                <span className="db-eyebrow-dot"/>
                <span className="db-eyebrow-text">Career dashboard · {new Date().getFullYear()}</span>
              </div>
              <h1 className="db-headline">
                Your<br/>
                <span className="db-headline-accent">roadmaps.</span>
              </h1>
            </div>

            <div className="db-actions">
              <button className="btn btn-ghost" onClick={() => window.location.href = "/mocktest"}>
                Mock test
              </button>
              <button className="btn btn-primary" onClick={() => window.location.href = "/generate"}>
                + New roadmap
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div className="db-error">✕ {error}</div>}

          {/* Stats */}
          {roadmaps.length > 0 && (
            <div className="db-stats">
              {[
                { label: "Total roadmaps", value: roadmaps.length },
                { label: "Unique roles",   value: new Set(roadmaps.map(r => r.role)).size },
                { label: "Skill levels",   value: new Set(roadmaps.map(r => r.level)).size },
                {
                  label: "Latest entry",
                  value: new Date(Math.max(...roadmaps.map(r => new Date(r.createdAt)))).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                },
              ].map((s, i) => (
                <div key={s.label} className="db-stat">
                  <div className="db-stat-label">{s.label}</div>
                  <div className="db-stat-val" style={{ fontFamily: i === 3 ? "var(--font-mono)" : undefined, fontSize: i === 3 ? "1.1rem" : undefined }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filter row + Grid */}
          {roadmaps.length > 0 && (
            <>
              <div className="db-filter-row">
                <div className="db-filter-title">
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-00)" }}>
                    All roadmaps
                  </span>
                  <span className="db-filter-count">{filtered.length} results</span>
                </div>

                <div className="db-filter-pills">
                  {levels.map(l => (
                    <button
                      key={l}
                      className={`db-filter-pill${filter === l ? " active" : ""}`}
                      onClick={() => setFilter(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }}/>

              <div className="db-grid">
                {filtered.map((r, i) => (
                  <RoadmapCard
                    key={r.id}
                    roadmap={r}
                    index={i}
                    onOpen={(id) => window.location.href = `/roadmap/${id}`}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {roadmaps.length === 0 && !error && (
            <div className="db-empty">
              <div className="db-empty-num">00</div>
              <div className="db-empty-title">No roadmaps yet</div>
              <p className="db-empty-sub">
                Generate your first AI career roadmap<br/>and start building your future today.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => window.location.href = "/generate"}>
                  Generate first roadmap
                </button>
                <button className="btn btn-ghost" onClick={() => window.location.href = "/mocktest"}>
                  Take mock test
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}