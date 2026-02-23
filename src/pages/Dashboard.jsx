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
  if (l.includes("begin")) return { color:"#22c55e", bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.25)"  };
  if (l.includes("inter")) return { color:"#f59e0b", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)" };
  if (l.includes("advan") || l.includes("expert")) return { color:"#ef4444", bg:"rgba(239,68,68,0.1)", border:"rgba(239,68,68,0.25)" };
  return { color:"rgba(232,232,232,0.5)", bg:"rgba(255,255,255,0.05)", border:"rgba(255,255,255,0.1)" };
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
        background: "#0e0e0e", border: "1px solid rgba(239,68,68,0.35)",
        borderRadius: 4, padding: "14px 16px", zIndex: 10,
        minWidth: 200, boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "rgba(232,232,232,0.7)", marginBottom: 12, lineHeight: 1.6 }}>
        Delete this roadmap?<br />
        <span style={{ color: "rgba(232,232,232,0.35)", fontSize: 10 }}>This cannot be undone.</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            flex: 1, padding: "7px 0", background: loading ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.5)", borderRadius: 2,
            color: "#ef4444", fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 10, letterSpacing: "0.1em", cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {loading ? "DELETING..." : "DELETE"}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1, padding: "7px 0", background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2,
            color: "rgba(232,232,232,0.5)", fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 10, letterSpacing: "0.1em", cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          CANCEL
        </button>
      </div>
    </motion.div>
  );
}

// ─── Roadmap Card ─────────────────────────────────────────────────────────────

function RoadmapCard({ roadmap, index, onClick, onDelete }) {
  const badge = getLevelBadge(roadmap.level);
  const [hovered, setHovered]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirm = async (e) => {
    e.stopPropagation();
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/roadmap/${roadmap.id}`);
      onDelete(roadmap.id); // optimistic remove from parent state
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

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
        border: `1px solid ${hovered ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 4, background: "#0a0a0a", overflow: "visible", position: "relative",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.5), 0 0 30px rgba(245,158,11,0.06)" : "none",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Amber top stripe on hover */}
        <div style={{ height: 2, borderRadius: "4px 4px 0 0", background: hovered ? "linear-gradient(90deg,transparent,#f59e0b,transparent)" : "transparent", transition: "background 0.25s" }} />

        <div style={{ padding: 24 }}>
          {/* Top row: badge + delete + arrow */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.16em",
              padding: "4px 10px", border: `1px solid ${badge.border}`, borderRadius: 2,
              background: badge.bg, color: badge.color,
            }}>
              {(roadmap.level || "CUSTOM").toUpperCase()}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
              {/* Delete button — fades in on hover */}
              <motion.button
                initial={false}
                animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleDeleteClick}
                title="Delete roadmap"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 2, padding: "4px 8px",
                  cursor: "pointer", color: "rgba(239,68,68,0.6)",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9, letterSpacing: "0.1em",
                  transition: "all 0.15s", pointerEvents: hovered ? "auto" : "none",
                  display: "flex", alignItems: "center", gap: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; e.currentTarget.style.color = "rgba(239,68,68,0.6)"; }}
              >
                {/* Trash icon */}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                DEL
              </motion.button>

              {/* Confirm popover */}
              <AnimatePresence>
                {showConfirm && (
                  <DeleteConfirm
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    loading={deleteLoading}
                  />
                )}
              </AnimatePresence>

              {/* Arrow icon */}
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                style={{ color: hovered ? "#f59e0b" : "rgba(232,232,232,0.2)", transition: "color 0.2s", transform: hovered ? "translate(2px,-2px)" : "none" }}>
                <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: "0.04em", color: "#f0f0f0", lineHeight: 1.1, marginBottom: 6 }}>
            {(roadmap.title || roadmap.role || "UNTITLED").toUpperCase()}
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "rgba(232,232,232,0.35)", marginBottom: 20, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {roadmap.role}
          </div>

          {/* Chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {roadmap.timePerDay && (
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(232,232,232,0.4)", padding: "3px 8px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 2 }}>
                ⏱ {roadmap.timePerDay}
              </span>
            )}
            {roadmap.duration && (
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(232,232,232,0.4)", padding: "3px 8px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 2 }}>
                📅 {roadmap.duration}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(232,232,232,0.25)", letterSpacing: "0.04em" }}>{formatDate(roadmap.createdAt)}</span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: hovered ? "#f59e0b" : "rgba(232,232,232,0.3)", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}>
            VIEW →
          </span>
        </div>

        {/* Index watermark */}
        <div style={{ position: "absolute", top: 16, right: 60, fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: "rgba(255,255,255,0.03)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>
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

  // ✅ Optimistically remove from state — no refetch, no flicker
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
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin  { to { transform:rotate(360deg) } }
        @keyframes blink { 50% { opacity:0 } }
        .db-root { min-height:100vh; background:#080808; font-family:'IBM Plex Mono',monospace; padding:calc(var(--navbar-height,56px) + 48px) 40px 80px; position:relative; overflow-x:hidden; color:#e8e8e8; }
        .db-grid { position:fixed; inset:0; opacity:0.025; pointer-events:none; background-image:linear-gradient(rgba(245,158,11,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.4) 1px,transparent 1px); background-size:80px 80px; }
        .db-stat { padding:20px 24px; border:1px solid rgba(255,255,255,0.07); border-radius:2px; background:#0a0a0a; position:relative; overflow:hidden; transition:border-color 0.2s; }
        .db-stat:hover { border-color:rgba(245,158,11,0.25); }
        .db-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(245,158,11,0.3),transparent); }
        .filter-btn { padding:7px 16px; border:1px solid rgba(255,255,255,0.08); background:transparent; color:rgba(232,232,232,0.4); font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.12em; cursor:pointer; border-radius:2px; transition:all 0.15s; }
        .filter-btn:hover { border-color:rgba(245,158,11,0.3); color:#f59e0b; }
        .filter-btn.active { border-color:rgba(245,158,11,0.5); background:rgba(245,158,11,0.08); color:#f59e0b; }
        .new-btn { padding:10px 22px; background:#f59e0b; color:#080808; border:none; font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700; letter-spacing:0.14em; cursor:pointer; border-radius:2px; transition:all 0.2s; }
        .new-btn:hover { background:#fbbf24; transform:translateY(-1px); box-shadow:0 8px 24px rgba(245,158,11,0.35); }
      `}</style>

      <div className="db-root">
        <div className="db-grid" />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", display: "inline-block", animation: "blink 2s infinite", boxShadow: "0 0 8px #f59e0b" }} />
                <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "#f59e0b" }}>CAREER DASHBOARD</span>
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(40px,6vw,72px)", letterSpacing: "0.02em", lineHeight: 0.9, textTransform: "uppercase" }}>
                YOUR<br />
                <span style={{ WebkitTextFillColor: "transparent", WebkitTextStroke: "1.5px rgba(232,232,232,0.25)" }}>JOURNEYS</span>
              </h1>
            </div>
            <button className="new-btn" onClick={() => navigate("/generate")}>+ GENERATE NEW</button>
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
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(232,232,232,0.25)", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: s.isDate ? 20 : 36, letterSpacing: "0.04em", color: "#f59e0b", lineHeight: 1 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "16px 20px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 2, marginBottom: 32 }}>
              <span style={{ color: "#ef4444", flexShrink: 0 }}>✕</span>
              <div>
                <div style={{ fontSize: 12, color: "#fca5a5", marginBottom: 8 }}>{error}</div>
                <button onClick={fetchData} style={{ fontSize: 10, letterSpacing: "0.1em", color: "#ef4444", background: "none", border: "1px solid rgba(239,68,68,0.3)", padding: "5px 12px", cursor: "pointer", borderRadius: 2 }}>↺ RETRY</button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "40px 0" }}>
              <div style={{ width: 20, height: 20, border: "1px solid rgba(245,158,11,0.3)", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
              <span style={{ fontSize: 11, letterSpacing: "0.14em", color: "rgba(232,232,232,0.3)" }}>LOADING ROADMAPS...</span>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && roadmaps.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 4 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: "rgba(245,158,11,0.1)", marginBottom: 16 }}>00</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: "0.06em", color: "rgba(232,232,232,0.4)", marginBottom: 12 }}>NO ROADMAPS YET</div>
              <div style={{ fontSize: 12, color: "rgba(232,232,232,0.25)", marginBottom: 32, lineHeight: 1.7 }}>Generate your first AI career roadmap<br />and start building your future today.</div>
              <button className="new-btn" onClick={() => navigate("/generate")}>GENERATE YOUR FIRST ROADMAP →</button>
            </motion.div>
          )}

          {/* Grid */}
          {!loading && roadmaps.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: "0.04em" }}>ALL ROADMAPS</div>
                  <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(232,232,232,0.3)" }}>{filtered.length} RESULTS</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {levels.map(l => (
                    <button key={l} className={`filter-btn${filter === l ? " active" : ""}`} onClick={() => setFilter(l)}>{l}</button>
                  ))}
                </div>
              </div>

              {/* AnimatePresence on the grid so exit animations play when cards are removed */}
              <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 12 }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((r, i) => (
                    <RoadmapCard
                      key={r.id}
                      roadmap={r}
                      index={i}
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