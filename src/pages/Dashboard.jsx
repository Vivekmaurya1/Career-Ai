// src/pages/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoadmaps } from "../api/roadmapApi";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

const normalizeList = (data) => Array.isArray(data) ? data : data?.data ?? data?.roadmaps ?? [];

const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getLevelBadge = (level = "") => {
  const l = level.toLowerCase();
  if (l.includes("begin")) return { color:"var(--success)", bg:"var(--success-bg)", border:"var(--success-border)" };
  if (l.includes("inter")) return { color:"var(--accent)", bg:"var(--accent-dim)", border:"var(--accent-border)" };
  if (l.includes("advan") || l.includes("expert")) return { color:"var(--danger)", bg:"var(--danger-bg)", border:"var(--danger-border)" };
  return { color:"var(--text-dim)", bg:"var(--input-bg)", border:"var(--border)" };
};

// ─── Shared button style factory ──────────────────────────────────────────────
const emptyBtnBase = {
  height: 38,
  padding: "0 22px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  cursor: "pointer",
  borderRadius: 2,
  transition: "all 0.2s",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

// ─── Delete confirmation popover ─────────────────────────────────────────────
function DeleteConfirm({ onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 4 }}
      transition={{ duration: 0.15 }}
      onClick={e => e.stopPropagation()}
      style={{
        position: "absolute", bottom: "calc(100% + 8px)", right: 0,
        background: "var(--bg-raised)", border: "1px solid var(--danger-border)",
        borderRadius: 4, padding: "14px 16px", zIndex: 10,
        minWidth: 200, boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.6 }}>
        Delete this roadmap?<br />
        <span style={{ color: "var(--text-dim)", fontSize: 10 }}>This cannot be undone.</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onConfirm} disabled={loading}
          style={{ flex: 1, padding: "7px 0", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 2, color: "var(--danger)", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.1em", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.15s" }}>
          {loading ? "DELETING..." : "DELETE"}
        </button>
        <button onClick={onCancel} disabled={loading}
          style={{ flex: 1, padding: "7px 0", background: "transparent", border: "1px solid var(--border)", borderRadius: 2, color: "var(--text-dim)", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s" }}>
          CANCEL
        </button>
      </div>
    </motion.div>
  );
}

// ─── Roadmap Card ─────────────────────────────────────────────────────────────
function RoadmapCard({ roadmap, index, onClick, onDelete }) {
  const badge = getLevelBadge(roadmap.level);
  const [hovered, setHovered]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (e) => { e.stopPropagation(); setShowConfirm(true); };

  const handleConfirm = async (e) => {
    e.stopPropagation();
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/roadmap/${roadmap.id}`);
      onDelete(roadmap.id);
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = (e) => { e.stopPropagation(); setShowConfirm(false); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (!deleteLoading) setShowConfirm(false); }}
      onClick={onClick}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <div style={{
        border: `1px solid ${hovered ? "var(--border-hover)" : "var(--border)"}`,
        borderRadius: 4, background: "var(--bg-surface)", overflow: "visible", position: "relative",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.5), 0 0 30px var(--accent-dim)` : "none",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Accent stripe */}
        <div style={{ height: 2, borderRadius: "4px 4px 0 0", background: hovered ? "var(--gradient-accent)" : "transparent", transition: "background 0.25s" }} />

        <div style={{ padding: 24 }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.16em",
                padding: "4px 10px", border: `1px solid ${badge.border}`, borderRadius: 2,
                background: badge.bg, color: badge.color,
              }}>
                {(roadmap.level || "CUSTOM").toUpperCase()}
              </span>
              {roadmap.yearsOfExperience && (
                <span style={{
                  fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.12em",
                  padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 2,
                  background: "var(--input-bg)", color: "var(--text-muted)",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  🕐 {roadmap.yearsOfExperience}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
              <motion.button
                initial={false}
                animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleDeleteClick}
                title="Delete roadmap"
                style={{
                  background: "transparent", border: "1px solid var(--danger-border)",
                  borderRadius: 2, padding: "4px 8px", cursor: "pointer", color: "var(--danger)",
                  fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.1em",
                  transition: "all 0.15s", pointerEvents: hovered ? "auto" : "none",
                  display: "flex", alignItems: "center", gap: 4, opacity: 0.6,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--danger-bg)"; e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.opacity = "0.6"; }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                DEL
              </motion.button>

              <AnimatePresence>
                {showConfirm && (
                  <DeleteConfirm onConfirm={handleConfirm} onCancel={handleCancel} loading={deleteLoading} />
                )}
              </AnimatePresence>

              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                style={{ color: hovered ? "var(--accent)" : "var(--text-dim)", transition: "color 0.2s, transform 0.2s", transform: hovered ? "translate(2px,-2px)" : "none" }}>
                <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: "0.04em", color: "var(--text-heading)", lineHeight: 1.1, marginBottom: 6 }}>
            {(roadmap.title || roadmap.role || "UNTITLED").toUpperCase()}
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "var(--text-dim)", marginBottom: 20, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {roadmap.role}
          </div>

          {/* Meta chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {roadmap.timePerDay && (
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "var(--text-muted)", padding: "3px 8px", border: "1px solid var(--border)", borderRadius: 2 }}>
                ⏱ {roadmap.timePerDay}
              </span>
            )}
            {roadmap.duration && (
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "var(--text-muted)", padding: "3px 8px", border: "1px solid var(--border)", borderRadius: 2 }}>
                📅 {roadmap.duration}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.04em" }}>{formatDate(roadmap.createdAt)}</span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: hovered ? "var(--accent)" : "var(--text-muted)", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}>
            VIEW →
          </span>
        </div>

        {/* Index watermark */}
        <div style={{ position: "absolute", top: 16, right: 60, fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: "var(--border)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("ALL");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getUserRoadmaps();
      setRoadmaps(normalizeList(data));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unknown error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = useCallback((id) => {
    setRoadmaps(prev => prev.filter(r => r.id !== id));
  }, []);

  const levels   = ["ALL", ...new Set(roadmaps.map(r => r.level).filter(Boolean))];
  const filtered = filter === "ALL" ? roadmaps : roadmaps.filter(r => r.level === filter);
  const roles    = [...new Set(roadmaps.map(r => r.role).filter(Boolean))];
  const latest   = roadmaps.length
    ? new Date(Math.max(...roadmaps.map(r => new Date(r.createdAt)))).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "--";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        @keyframes spin  { to { transform:rotate(360deg) } }
        @keyframes blink { 50% { opacity:0 } }
        .db-root {
          min-height:100vh; background: var(--bg);
          font-family:'IBM Plex Mono',monospace;
          padding:calc(var(--navbar-height,56px) + 48px) 40px 80px;
          position:relative; overflow-x:hidden;
          color: var(--text);
          transition: background 0.4s ease, color 0.3s ease;
        }
        .db-grid {
          position:fixed; inset:0; opacity: var(--grid-opacity, 0.025); pointer-events:none;
          background-image: linear-gradient(var(--grid-color) 1px,transparent 1px),
                            linear-gradient(90deg,var(--grid-color) 1px,transparent 1px);
          background-size:80px 80px;
        }
        .db-stat {
          padding:20px 24px; border:1px solid var(--border); border-radius:2px;
          background: var(--bg-surface); position:relative; overflow:hidden;
          transition: border-color 0.2s, background 0.4s;
        }
        .db-stat:hover { border-color: var(--border-hover); }
        .db-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: var(--gradient-accent); }
        .filter-btn {
          padding:7px 16px; border:1px solid var(--border); background:transparent;
          color: var(--text-muted); font-family:'IBM Plex Mono',monospace;
          font-size:10px; letter-spacing:0.12em; cursor:pointer; border-radius:2px;
          transition:all 0.15s;
        }
        .filter-btn:hover  { border-color: var(--accent-border); color: var(--accent); }
        .filter-btn.active { border-color: var(--accent-border); background: var(--accent-dim); color: var(--accent); }
        .new-btn {
          height: 38px;
          padding: 0 22px;
          background: var(--accent);
          color: var(--bg);
          border: none;
          font-family:'IBM Plex Mono',monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.2s;
          white-space: nowrap;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .new-btn:hover {
          background: var(--accent-bright);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px var(--accent-glow);
        }
        .outline-btn {
          height: 38px;
          padding: 0 22px;
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--accent-border);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.2s;
          white-space: nowrap;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .outline-btn:hover {
          background: var(--accent-dim);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px var(--accent-glow);
        }
      `}</style>

      <div className="db-root">
        <div className="db-grid" />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "blink 2s infinite", boxShadow: "0 0 8px var(--accent)" }} />
                <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--accent)" }}>CAREER DASHBOARD</span>
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(40px,6vw,72px)", letterSpacing: "0.02em", lineHeight: 0.9, textTransform: "uppercase", color: "var(--text-heading)" }}>
                YOUR<br />
                <span style={{ WebkitTextFillColor: "transparent", WebkitTextStroke: "1.5px var(--text-dim)" }}>JOURNEYS</span>
              </h1>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="outline-btn" onClick={() => navigate("/mocktest")}>TAKE MOCK TEST →</button>
              <button className="new-btn" onClick={() => navigate("/generate")}>+ GENERATE NEW</button>
            </div>
          </div>

          {/* Stats */}
          {roadmaps.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, marginBottom: 48 }}>
              {[
                { label: "TOTAL ROADMAPS", value: roadmaps.length, isDate: false },
                { label: "UNIQUE ROLES",   value: roles.length,    isDate: false },
                { label: "SKILL LEVELS",   value: [...new Set(roadmaps.map(r => r.level).filter(Boolean))].length, isDate: false },
                { label: "LATEST ENTRY",   value: latest,          isDate: true  },
              ].map((s, i) => (
                <div key={i} className="db-stat">
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--text-dim)", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: s.isDate ? 20 : 36, letterSpacing: "0.04em", color: "var(--accent)", lineHeight: 1 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "16px 20px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 2, marginBottom: 32 }}>
              <span style={{ color: "var(--danger)", flexShrink: 0 }}>✕</span>
              <div>
                <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 8 }}>{error}</div>
                <button onClick={fetchData} style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--danger)", background: "none", border: "1px solid var(--danger-border)", padding: "5px 12px", cursor: "pointer", borderRadius: 2 }}>↺ RETRY</button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "40px 0" }}>
              <div style={{ width: 20, height: 20, border: "1px solid var(--accent-border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
              <span style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--text-dim)" }}>LOADING ROADMAPS...</span>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && roadmaps.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "1px dashed var(--border)",
                borderRadius: 4,
              }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: "var(--accent-dim)", marginBottom: 16 }}>00</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 12 }}>
                NO ROADMAPS YET
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 32, lineHeight: 1.7 }}>
                Generate your first AI career roadmap<br />and start building your future today.
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                <button className="new-btn" onClick={() => navigate("/generate")}>
                  GENERATE YOUR FIRST ROADMAP →
                </button>
                <button className="outline-btn" onClick={() => navigate("/mocktest")}>
                  TAKE MOCK TEST →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Roadmap grid ── */}
          {!loading && roadmaps.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: "0.04em", color: "var(--text-heading)" }}>ALL ROADMAPS</div>
                  <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--text-dim)" }}>{filtered.length} RESULTS</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {levels.map(l => (
                    <button key={l} className={`filter-btn${filter === l ? " active" : ""}`} onClick={() => setFilter(l)}>{l}</button>
                  ))}
                </div>
              </div>

              <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 12 }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((r, i) => (
                    <RoadmapCard
                      key={r.id} roadmap={r} index={i}
                      onClick={() => navigate(`/roadmap/${r.id}`)}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </>
  );
}