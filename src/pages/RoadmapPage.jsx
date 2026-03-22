// pages/RoadmapPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { getRoadmapById, saveProgress, getProgress } from "../api/roadmapApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  normalizeRoadmap, loadLocalProgress, saveLocalProgress, calcOverallPercent,
} from "../utils/roadmap";
import { ROADMAP_TABS, PHASE_COLORS } from "../constants";

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange, size = 16 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      title={checked ? "Mark incomplete" : "Mark done"}
      style={{
        width: size, height: size, flexShrink: 0,
        border: `1.5px solid ${checked ? "#4ade80" : "var(--text-faint)"}`,
        borderRadius: 4,
        background: checked ? "rgba(74,222,128,0.12)" : "var(--bg-raised)",
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", transition: "all 0.15s", padding: 0,
      }}
    >
      {checked && (
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 72 }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const color = pct >= 100 ? "#4ade80" : pct >= 60 ? "var(--accent)" : pct >= 30 ? "#60a5fa" : "var(--text-faint)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ - (circ * pct) / 100}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1), stroke 0.4s" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: size * 0.22, fontWeight: 600, color, lineHeight: 1 }}>{pct}</span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: size * 0.1, color: "var(--text-dim)", letterSpacing: "0.08em" }}>%</span>
      </div>
    </div>
  );
}

// ─── TopicDetailPanel (rich detail view with sidebar) ─────────────────────────
function TopicDetailPanel({ node, progress, setProgress, onClose, originRect }) {
  const key  = `phase-${node.phaseIdx}-topic-${node.topicIdx}`;
  const done = !!progress[key];
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: "overview",
      label: "Overview",
      icon: "◈",
      color: "#f5f3ff",
      accent: "var(--accent-bright)",
      items: [node.topic.topic_name || `Topic ${node.topicIdx + 1}`],
      description: node.topic.description || null,
    },
    {
      id: "subtopics",
      label: "Subtopics",
      icon: "◎",
      color: "#60a5fa",
      accent: "#93c5fd",
      items: node.topic.subtopics || [],
    },
    {
      id: "concepts",
      label: "Concepts to Master",
      icon: "⬡",
      color: "var(--accent)",
      accent: "var(--accent-bright)",
      items: node.topic.concepts_to_master || [],
    },
    {
      id: "practice",
      label: "Practice",
      icon: "◉",
      color: "#fb923c",
      accent: "#fdba74",
      items: node.topic.recommended_practice || [],
    },
    ...(node.topic.mini_project ? [{
      id: "project",
      label: "Mini Project",
      icon: "★",
      color: "#4ade80",
      accent: "#86efac",
      items: [typeof node.topic.mini_project === "string"
        ? node.topic.mini_project
        : node.topic.mini_project?.title].filter(Boolean),
      projectDetail: typeof node.topic.mini_project === "object" ? node.topic.mini_project : null,
    }] : []),
  ].filter((s) => s.items.length > 0);

  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tx = originRect ? originRect.left + originRect.width / 2 - vw / 2 : 0;
  const ty = originRect ? originRect.top + originRect.height / 2 - vh / 2 : 0;

  return (
    <AnimatePresence>
      <motion.div
        key="topic-overlay"
        initial={{ opacity: 0, scale: 0.92, x: tx, y: ty, borderRadius: 24 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0, borderRadius: 0 }}
        exit={{ opacity: 0, scale: 0.94, x: tx, y: ty, borderRadius: 24 }}
        transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
        style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "var(--bg)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Ambient background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 55% 45% at 5% 0%, rgba(90,62,180,0.16) 0%, transparent 60%), " +
            "radial-gradient(ellipse 40% 35% at 95% 100%, rgba(96,165,250,0.07) 0%, transparent 55%)",
        }}/>
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(167,139,250,0.02) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(167,139,250,0.02) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}/>

        {/* ── Top Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.28 }}
          style={{
            flexShrink: 0, position: "relative", zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 28px",
            borderBottom: "1px solid var(--border)",
            background: "color-mix(in srgb, var(--bg) 85%, transparent)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px", borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-raised)",
                color: "var(--text-muted)", cursor: "pointer",
                fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.12em",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent-bright)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--bg-raised)"; }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M7.5 1.5L3 5.5l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              BACK
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.2em", color: "var(--text-faint)", textTransform: "uppercase" }}>
                Phase {String(node.phaseIdx + 1).padStart(2,"0")}
              </span>
              <span style={{ color: "var(--text-faint)", fontSize: 10 }}>›</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.2em", color: node.color.accent, textTransform: "uppercase" }}>
                Topic {String(node.topicIdx + 1).padStart(2,"0")}
              </span>
              <span style={{ color: "var(--text-faint)", fontSize: 10 }}>›</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", color: "var(--text-dim)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {node.topic.topic_name || `Topic ${node.topicIdx + 1}`}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Stats pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[
                { label: "Subtopics", count: node.topic.subtopics?.length || 0, color: "#60a5fa" },
                { label: "Concepts", count: node.topic.concepts_to_master?.length || 0, color: "var(--accent)" },
                { label: "Practice", count: node.topic.recommended_practice?.length || 0, color: "#fb923c" },
              ].filter(s => s.count > 0).map((s) => (
                <div key={s.label} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 999,
                  background: `${s.color}10`, border: `1px solid ${s.color}28`,
                  fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.1em",
                  color: s.color,
                }}>
                  <span style={{ fontWeight: 600, fontSize: 10 }}>{s.count}</span>
                  {s.label}
                </div>
              ))}
            </div>

            <div style={{ width: 1, height: 20, background: "var(--border)" }}/>

            {/* Completion toggle */}
            <button
              onClick={() => setProgress((p) => ({ ...p, [key]: !done }))}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 16px", borderRadius: 10, cursor: "pointer",
                border: `1px solid ${done ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.1)"}`,
                background: done ? "rgba(74,222,128,0.1)" : "var(--bg-raised)",
                color: done ? "#4ade80" : "var(--text-muted)",
                fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.1em",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (!done) { e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)"; e.currentTarget.style.color = "#4ade80"; } }}
              onMouseLeave={(e) => { if (!done) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--text-muted)"; } }}
            >
              <span style={{
                width: 14, height: 14, borderRadius: "50%",
                border: `1.5px solid ${done ? "#4ade80" : "var(--text-faint)"}`,
                background: done ? "#4ade80" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.2s",
              }}>
                {done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="var(--bg)" strokeWidth="1.6" strokeLinecap="round"/></svg>}
              </span>
              {done ? "COMPLETED" : "MARK DONE"}
            </button>
          </div>
        </motion.div>

        {/* ── Body: sidebar + main ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 1 }}>

          {/* ── Left Sidebar ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.32 }}
            style={{
              width: 280, flexShrink: 0,
              borderRight: "1px solid var(--border)",
              background: "var(--bg-raised)",
              display: "flex", flexDirection: "column",
              overflowY: "auto", overflowX: "hidden",
            }}
          >
            {/* Topic identity */}
            <div style={{ padding: "28px 22px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "3px 10px", borderRadius: 999, marginBottom: 14,
                background: `${node.color.accent}12`,
                border: `1px solid ${node.color.border}`,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: node.color.accent, flexShrink: 0 }}/>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.16em", color: node.color.accent, textTransform: "uppercase" }}>
                  {node.phaseTitle}
                </span>
              </div>

              <h2 style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 20, fontWeight: 800, lineHeight: 1.1,
                color: "var(--text-heading)", margin: "0 0 10px",
              }}>
                {node.topic.topic_name || `Topic ${node.topicIdx + 1}`}
              </h2>

              {node.topic.description && (
                <p style={{
                  fontSize: 12, color: "var(--text-dim)",
                  lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans',sans-serif",
                }}>
                  {node.topic.description}
                </p>
              )}
            </div>

            {/* Progress block */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.18em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 10 }}>
                Topic Progress
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: done ? "100%" : "0%", borderRadius: 999, background: done ? "#4ade80" : node.color.accent, transition: "width 0.5s ease" }}/>
                </div>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: done ? "#4ade80" : "var(--text-dim)" }}>
                  {done ? "100%" : "0%"}
                </span>
              </div>
              <div style={{
                padding: "8px 12px", borderRadius: 9,
                background: done ? "rgba(74,222,128,0.07)" : "var(--bg-raised)",
                border: `1px solid ${done ? "rgba(74,222,128,0.2)" : "var(--border)"}`,
                fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.1em",
                color: done ? "#4ade80" : "var(--text-dim)", textTransform: "uppercase",
              }}>
                {done ? "✓ Topic Completed" : "○ Not Yet Started"}
              </div>
            </div>

            {/* Section navigator */}
            <div style={{ padding: "18px 22px", flex: 1 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.18em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 10 }}>
                Sections
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(activeSection === sec.id ? null : sec.id);
                      document.getElementById(`section-${sec.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                      border: `1px solid ${activeSection === sec.id ? sec.color + "30" : "transparent"}`,
                      background: activeSection === sec.id ? `${sec.color}0a` : "transparent",
                      textAlign: "left", transition: "all 0.16s",
                    }}
                    onMouseEnter={(e) => { if (activeSection !== sec.id) e.currentTarget.style.background = "var(--bg-raised)"; }}
                    onMouseLeave={(e) => { if (activeSection !== sec.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: `${sec.color}12`,
                      border: `1px solid ${sec.color}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: sec.color,
                    }}>
                      {sec.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 1 }}>
                        {sec.label}
                      </div>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: sec.color, letterSpacing: "0.08em" }}>
                        {sec.items.length} item{sec.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      background: `${sec.color}15`, border: `1px solid ${sec.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'DM Mono',monospace", fontSize: 9, color: sec.color, fontWeight: 600,
                    }}>
                      {sec.items.length}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary stats at bottom */}
            <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {[
                  { label: "Total Items", value: totalItems, color: "var(--accent)" },
                  { label: "Sections", value: sections.length, color: "#60a5fa" },
                  { label: "Phase", value: `P${node.phaseIdx + 1}`, color: node.color.accent },
                  { label: "Topic", value: `T${node.topicIdx + 1}`, color: node.color.accent },
                ].map((s) => (
                  <div key={s.label} style={{
                    padding: "10px 11px", borderRadius: 10,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                  }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: s.color }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Main Content ── */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 48px 80px" }}>

              {/* Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.36 }}
                style={{ marginBottom: 48 }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.22em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 12 }}>
                      {node.phaseTitle} · Topic {node.topicIdx + 1}
                    </div>
                    <h1 style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: "clamp(32px, 4.5vw, 58px)",
                      fontWeight: 800, lineHeight: 0.96,
                      color: "var(--text-heading)", margin: "0 0 16px",
                      letterSpacing: "-0.02em",
                    }}>
                      {node.topic.topic_name || `Topic ${node.topicIdx + 1}`}
                    </h1>
                    {node.topic.description && (
                      <p style={{
                        fontSize: 15, color: "var(--text-muted)",
                        lineHeight: 1.75, margin: 0, maxWidth: 580,
                        fontFamily: "'DM Sans',sans-serif",
                      }}>
                        {node.topic.description}
                      </p>
                    )}
                  </div>

                  {/* Completion ring */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ position: "relative", width: 80, height: 80 }}>
                      <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
                        <circle cx="40" cy="40" r="33" fill="none"
                          stroke={done ? "#4ade80" : node.color.accent}
                          strokeWidth="4"
                          strokeDasharray={207.3}
                          strokeDashoffset={done ? 0 : 207.3}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 0.7s ease, stroke 0.3s" }}
                        />
                      </svg>
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: done ? "#4ade80" : "var(--text-faint)", lineHeight: 1 }}>
                          {done ? "✓" : "○"}
                        </span>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, color: "var(--text-faint)", letterSpacing: "0.1em", marginTop: 3 }}>
                          {done ? "DONE" : "OPEN"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick-stats strip */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
                  {sections.map((sec) => (
                    <div key={sec.id} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 999,
                      background: `${sec.color}0e`, border: `1px solid ${sec.color}22`,
                    }}>
                      <span style={{ fontSize: 11, color: sec.color }}>{sec.icon}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: sec.color }}>
                        {sec.items.length} {sec.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── Sections ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                {sections.map((sec, secIdx) => (
                  <motion.div
                    key={sec.id}
                    id={`section-${sec.id}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 + secIdx * 0.06, duration: 0.32 }}
                  >
                    {/* Section header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                        background: `${sec.color}12`, border: `1px solid ${sec.color}28`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 17, color: sec.color,
                      }}>
                        {sec.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-heading)" }}>
                          {sec.label}
                        </div>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", color: sec.color, marginTop: 2 }}>
                          {sec.items.length} item{sec.items.length !== 1 ? "s" : ""} to cover
                        </div>
                      </div>
                      <div style={{
                        padding: "5px 13px", borderRadius: 999,
                        background: `${sec.color}10`, border: `1px solid ${sec.color}28`,
                        fontFamily: "'DM Mono',monospace", fontSize: 8,
                        letterSpacing: "0.1em", color: sec.color,
                      }}>
                        {String(secIdx + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
                      </div>
                    </div>

                    {/* Accent divider */}
                    <div style={{
                      height: 1, marginBottom: 18,
                      background: `linear-gradient(90deg, ${sec.color}35, ${sec.color}08, transparent)`,
                    }}/>

                    {/* Items grid */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: sec.items.length > 3 ? "repeat(auto-fill, minmax(260px, 1fr))" : "1fr",
                      gap: 10,
                    }}>
                      {sec.items.map((item, ii) => (
                        <div
                          key={ii}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12,
                            padding: "14px 16px",
                            borderRadius: 14,
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            position: "relative", overflow: "hidden",
                            transition: "border-color 0.18s, background 0.18s",
                            cursor: "default",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${sec.color}30`; e.currentTarget.style.background = `${sec.color}07`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
                        >
                          {/* Left accent bar */}
                          <div style={{
                            position: "absolute", left: 0, top: 0, bottom: 0,
                            width: 3, borderRadius: "14px 0 0 14px",
                            background: `linear-gradient(to bottom, ${sec.color}70, ${sec.color}20)`,
                          }}/>

                          {/* Number badge */}
                          <div style={{
                            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                            background: `${sec.color}14`, border: `1px solid ${sec.color}28`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'DM Mono',monospace", fontSize: 9, color: sec.color, fontWeight: 600,
                          }}>
                            {String(ii + 1).padStart(2, "0")}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13.5, color: "var(--text-heading)",
                              lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif",
                              fontWeight: 500,
                            }}>
                              {String(item)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Project detail expansion */}
                    {sec.id === "project" && sec.projectDetail && (
                      <div style={{
                        marginTop: 14, padding: "18px 20px",
                        borderRadius: 16, border: "1px solid rgba(74,222,128,0.18)",
                        background: "rgba(74,222,128,0.05)",
                      }}>
                        {sec.projectDetail.description && (
                          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 12px", fontFamily: "'DM Sans',sans-serif" }}>
                            {sec.projectDetail.description}
                          </p>
                        )}
                        {sec.projectDetail.features?.length > 0 && (
                          <div>
                            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.16em", color: "#4ade80", marginBottom: 8, textTransform: "uppercase" }}>Features</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {sec.projectDetail.features.map((f, fi) => (
                                <span key={fi} style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.22)", fontSize: 11, color: "#86efac", fontFamily: "'DM Mono',monospace" }}>
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* ── Bottom CTA ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.3 }}
                style={{
                  marginTop: 52, padding: "28px 32px",
                  borderRadius: 22, border: "1px solid var(--border)",
                  background: "var(--bg-raised)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-heading)", marginBottom: 5 }}>
                    {done ? "Topic Completed! 🎉" : "Ready to mark this topic done?"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "'DM Sans',sans-serif" }}>
                    {done
                      ? "Great work! Move on to the next topic in your learning path."
                      : `Cover all ${totalItems} items across ${sections.length} sections, then mark as complete.`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <button
                    onClick={onClose}
                    style={{
                      padding: "11px 22px", borderRadius: 12, cursor: "pointer",
                      border: "1px solid var(--border)",
                      background: "var(--bg-raised)",
                      color: "var(--text-muted)",
                      fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.1em",
                      transition: "all 0.18s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border)"; e.currentTarget.style.color = "var(--text-heading)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    BACK TO ROADMAP
                  </button>
                  <button
                    onClick={() => setProgress((p) => ({ ...p, [key]: !done }))}
                    style={{
                      padding: "11px 22px", borderRadius: 12, cursor: "pointer",
                      border: `1px solid ${done ? "rgba(74,222,128,0.4)" : node.color.border}`,
                      background: done ? "rgba(74,222,128,0.12)" : `${node.color.accent}18`,
                      color: done ? "#4ade80" : node.color.accent,
                      fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.1em",
                      transition: "all 0.2s",
                    }}
                  >
                    {done ? "✓ COMPLETED" : "MARK AS DONE"}
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── PhaseRoadmapPanel ────────────────────────────────────────────────────────
function PhaseRoadmapPanel({ phases, progress, setProgress }) {
  const nodes = phases.flatMap((phase, phaseIdx) =>
    phase.topics.map((topic, topicIdx) => ({
      id: `phase-${phaseIdx}-topic-${topicIdx}`,
      phaseIdx, topicIdx, topic,
      phaseTitle: phase.phase_title || `Phase ${phaseIdx + 1}`,
      phaseOutcome: phase.outcome || "",
      color: PHASE_COLORS[phaseIdx % PHASE_COLORS.length],
    }))
  );

  const [selectedId,   setSelectedId]   = useState(null);
  const [originRect,   setOriginRect]   = useState(null);
  const cardRefs = useRef({});

  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;

  const handleSelect = (node, locked) => {
    if (locked) return;
    const el = cardRefs.current[node.id];
    if (el) setOriginRect(el.getBoundingClientRect());
    setSelectedId(node.id);
  };

  const handleClose = () => {
    setSelectedId(null);
    setOriginRect(null);
  };

  if (!nodes.length) return null;

  const phaseCompletion = phases.map((phase, phaseIdx) => {
    const phaseKeys = phase.topics.map((_, ti) => `phase-${phaseIdx}-topic-${ti}`);
    const doneCount = phaseKeys.filter((k) => progress[k]).length;
    return { doneCount, total: phaseKeys.length, pct: phaseKeys.length ? Math.round((doneCount / phaseKeys.length) * 100) : 0 };
  });

  return (
    <>
      {selectedNode && (
        <TopicDetailPanel
          node={selectedNode}
          progress={progress}
          setProgress={setProgress}
          onClose={handleClose}
          originRect={originRect}
        />
      )}

      <div className="rp-journey-wrap">
        {/* Phase summary row */}
        <div className="rp-journey-summary">
          {phases.map((phase, phaseIdx) => {
            const summary = phaseCompletion[phaseIdx];
            const color   = PHASE_COLORS[phaseIdx % PHASE_COLORS.length];
            return (
              <div
                key={`${phase.phase_title || "phase"}-${phaseIdx}`}
                className="rp-phase-summary"
                style={{ "--phase-accent": color.accent, "--phase-border": color.border }}
              >
                <div className="rp-phase-summary-tag">Phase {String(phaseIdx + 1).padStart(2, "0")}</div>
                <strong>{phase.phase_title || `Phase ${phaseIdx + 1}`}</strong>
                <span>{summary.doneCount}/{summary.total} topics complete</span>
                <div className="rp-phase-summary-bar">
                  <div style={{ width: `${summary.pct}%`, background: color.accent }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Track */}
        <div className="rp-journey-track">
          <div className="rp-track-line"/>
          <div className="rp-track-scroll">
            <div className="rp-track-row">
              {nodes.map((node, index) => {
                const done   = !!progress[node.id];
                const locked = index > 0 && nodes.slice(0, index).some((prev) => !progress[prev.id]);

                return (
                  <motion.div
                    key={node.id}
                    className={`rp-track-node${index % 2 ? " lower" : " upper"}${locked ? " locked" : ""}${done ? " done" : ""}`}
                    style={{ "--node-accent": node.color.accent, "--node-border": node.color.border }}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: index * 0.04 }}
                  >
                    <div className="rp-track-node-anchor">
                      <button
                        type="button"
                        className="rp-track-dot"
                        onClick={() => handleSelect(node, locked)}
                      >
                        <span/>
                      </button>
                    </div>

                    <button
                      ref={(el) => { cardRefs.current[node.id] = el; }}
                      type="button"
                      className="rp-track-card"
                      onClick={() => handleSelect(node, locked)}
                      style={{ position: "relative" }}
                    >
                      <div className="rp-track-card-top">
                        <span className="rp-track-phase">P{node.phaseIdx + 1}</span>
                        <span className={`rp-track-state${done ? " done" : ""}${locked ? " locked" : ""}`}>
                          {locked ? "Locked" : done ? "Done" : "Open"}
                        </span>
                      </div>
                      <div className="rp-track-title">{node.topic.topic_name || `Topic ${node.topicIdx + 1}`}</div>
                      <div className="rp-track-meta">
                        <span>{node.phaseTitle}</span>
                        <span>{(node.topic.subtopics?.length || 0) + (node.topic.concepts_to_master?.length || 0)} items</span>
                      </div>
                      {!locked && (
                        <div style={{
                          marginTop: 10,
                          display: "flex", alignItems: "center", gap: 6,
                          fontFamily: "'DM Mono',monospace", fontSize: 8,
                          letterSpacing: "0.14em", textTransform: "uppercase",
                          color: node.color.accent, opacity: 0.7,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M3.5 5h3M5 3.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          View Details
                        </div>
                      )}
                      {locked && (
                        <div className="rp-track-lock">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 10V8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            <rect x="6" y="10" width="12" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
                          </svg>
                          <span>Finish all previous topics</span>
                        </div>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── WeeklyTrackPanel ─────────────────────────────────────────────────────────
function WeeklyTrackPanel({ weekly, progress, setProgress }) {
  const nodes = weekly.map((w, i) => ({
    id: `week-${i}`,
    idx: i,
    week: w,
    label: w.focus || `Week ${w.week || i + 1}`,
    meta: `${w.topics_to_cover?.length || 0} topics · ${w.practice_goals?.length || 0} practice`,
    tag: `WK ${String(w.week || i + 1).padStart(2, "0")}`,
    color: PHASE_COLORS[i % PHASE_COLORS.length],
  }));

  const [selectedId, setSelectedId] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const cardRefs = useRef({});

  const handleSelect = (node) => {
    const el = cardRefs.current[node.id];
    if (el) setOriginRect(el.getBoundingClientRect());
    setSelectedId(selectedId === node.id ? null : node.id);
  };

  if (!nodes.length) return null;

  // Summary: group weeks into sets of 4 for the summary strip
  const groupSize = 4;
  const groups = [];
  for (let i = 0; i < nodes.length; i += groupSize) {
    groups.push(nodes.slice(i, i + groupSize));
  }

  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;

  return (
    <>
      {/* Expanded week detail overlay */}
      {selectedNode && (
        <AnimatePresence>
          <motion.div
            key="week-overlay"
            initial={{ opacity: 0, scale: 0.92, x: originRect ? originRect.left + originRect.width / 2 - window.innerWidth / 2 : 0, y: originRect ? originRect.top + originRect.height / 2 - window.innerHeight / 2 : 0, borderRadius: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, borderRadius: 0 }}
            exit={{ opacity: 0, scale: 0.94, borderRadius: 24 }}
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "var(--bg)", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 55% 45% at 5% 0%, rgba(90,62,180,0.16) 0%, transparent 60%)" }}/>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(167,139,250,0.02) 1px, transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.02) 1px,transparent 1px)", backgroundSize: "64px 64px" }}/>

            {/* Top bar */}
            <div style={{ flexShrink: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--bg) 85%, transparent)", backdropFilter: "blur(20px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setSelectedId(null)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-raised)", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.12em", transition: "all 0.18s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent-bright)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--bg-raised)"; }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7.5 1.5L3 5.5l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  BACK
                </button>
                <span style={{ color: "var(--text-faint)", fontSize: 10 }}>›</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.2em", color: selectedNode.color.accent, textTransform: "uppercase" }}>{selectedNode.tag}</span>
                <span style={{ color: "var(--text-faint)", fontSize: 10 }}>›</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", color: "var(--text-dim)" }}>{selectedNode.label}</span>
              </div>
              <button onClick={() => setProgress((p) => ({ ...p, [selectedNode.id]: !progress[selectedNode.id] }))}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 10, cursor: "pointer", border: `1px solid ${progress[selectedNode.id] ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.1)"}`, background: progress[selectedNode.id] ? "rgba(74,222,128,0.1)" : "var(--bg-raised)", color: progress[selectedNode.id] ? "#4ade80" : "var(--text-muted)", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.1em", transition: "all 0.2s" }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${progress[selectedNode.id] ? "#4ade80" : "var(--text-faint)"}`, background: progress[selectedNode.id] ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  {progress[selectedNode.id] && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="var(--bg)" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                </span>
                {progress[selectedNode.id] ? "COMPLETED" : "MARK DONE"}
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 48px 80px" }}>
                <div style={{ marginBottom: 12, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.22em", color: "var(--text-faint)", textTransform: "uppercase" }}>Weekly Schedule · {selectedNode.tag}</div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,4.5vw,58px)", fontWeight: 800, lineHeight: 0.96, color: "var(--text-heading)", margin: "0 0 32px", letterSpacing: "-0.02em" }}>{selectedNode.label}</h1>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
                  {selectedNode.week.topics_to_cover?.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}><span style={{ fontSize: 11, color: "#60a5fa" }}>◎</span><span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "#60a5fa" }}>{selectedNode.week.topics_to_cover.length} Topics</span></div>}
                  {selectedNode.week.practice_goals?.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)" }}><span style={{ fontSize: 11, color: "#fb923c" }}>◉</span><span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fb923c" }}>{selectedNode.week.practice_goals.length} Practice</span></div>}
                  {selectedNode.week.project_milestone && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}><span style={{ fontSize: 11, color: "#4ade80" }}>★</span><span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4ade80" }}>Milestone</span></div>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {selectedNode.week.topics_to_cover?.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#60a5fa" }}>◎</div>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-heading)" }}>Topics to Cover</span>
                        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(96,165,250,0.3),transparent)" }}/>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 9 }}>
                        {selectedNode.week.topics_to_cover.map((t, j) => {
                          const tk = `${selectedNode.id}-topic-${j}`; const td = !!progress[tk];
                          return (
                            <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 13, background: td ? "rgba(74,222,128,0.05)" : "var(--bg-surface)", border: `1px solid ${td ? "rgba(74,222,128,0.2)" : "var(--border)"}`, position: "relative", overflow: "hidden", transition: "all 0.18s", cursor: "pointer" }}
                              onClick={() => setProgress((p) => ({ ...p, [tk]: !td }))}
                              onMouseEnter={(e) => { if (!td) { e.currentTarget.style.borderColor = "rgba(96,165,250,0.25)"; e.currentTarget.style.background = "rgba(96,165,250,0.06)"; }}}
                              onMouseLeave={(e) => { if (!td) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-surface)"; }}}
                            >
                              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "13px 0 0 13px", background: td ? "linear-gradient(to bottom,#4ade8070,#4ade8020)" : "linear-gradient(to bottom,rgba(96,165,250,0.5),rgba(96,165,250,0.12))" }}/>
                              <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: td ? "rgba(74,222,128,0.12)" : "rgba(96,165,250,0.1)", border: `1px solid ${td ? "rgba(74,222,128,0.28)" : "rgba(96,165,250,0.22)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {td ? <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2L7.5 2" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                    : <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#60a5fa", fontWeight: 600 }}>{String(j+1).padStart(2,"0")}</span>}
                              </div>
                              <span style={{ fontSize: 13, color: td ? "#4ade80" : "var(--text-muted)", lineHeight: 1.55, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, textDecoration: td ? "line-through" : "none", transition: "all 0.18s" }}>{String(t)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedNode.week.practice_goals?.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fb923c" }}>◉</div>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-heading)" }}>Practice Goals</span>
                        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(251,146,60,0.3),transparent)" }}/>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 9 }}>
                        {selectedNode.week.practice_goals.map((g, j) => {
                          const pk = `${selectedNode.id}-practice-${j}`; const pd = !!progress[pk];
                          return (
                            <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 13, background: pd ? "rgba(74,222,128,0.05)" : "var(--bg-surface)", border: `1px solid ${pd ? "rgba(74,222,128,0.2)" : "var(--border)"}`, position: "relative", overflow: "hidden", transition: "all 0.18s", cursor: "pointer" }}
                              onClick={() => setProgress((p) => ({ ...p, [pk]: !pd }))}
                              onMouseEnter={(e) => { if (!pd) { e.currentTarget.style.borderColor = "rgba(251,146,60,0.25)"; e.currentTarget.style.background = "rgba(251,146,60,0.06)"; }}}
                              onMouseLeave={(e) => { if (!pd) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-surface)"; }}}
                            >
                              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "13px 0 0 13px", background: pd ? "linear-gradient(to bottom,#4ade8070,#4ade8020)" : "linear-gradient(to bottom,rgba(251,146,60,0.5),rgba(251,146,60,0.12))" }}/>
                              <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: pd ? "rgba(74,222,128,0.12)" : "rgba(251,146,60,0.1)", border: `1px solid ${pd ? "rgba(74,222,128,0.28)" : "rgba(251,146,60,0.22)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {pd ? <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2L7.5 2" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                    : <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#fb923c", fontWeight: 600 }}>{String(j+1).padStart(2,"0")}</span>}
                              </div>
                              <span style={{ fontSize: 13, color: pd ? "#4ade80" : "var(--text-muted)", lineHeight: 1.55, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, textDecoration: pd ? "line-through" : "none", transition: "all 0.18s" }}>{String(g)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedNode.week.project_milestone && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 18px", borderRadius: 16, background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "16px 0 0 16px", background: "linear-gradient(to bottom,#4ade8070,#4ade8020)" }}/>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#4ade80", flexShrink: 0 }}>★</div>
                      <div><div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", color: "rgba(74,222,128,0.6)", textTransform: "uppercase", marginBottom: 4 }}>Milestone</div><div style={{ fontSize: 13, color: "#86efac", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, lineHeight: 1.6 }}>{selectedNode.week.project_milestone}</div></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="rp-journey-wrap">
        {/* Summary strip */}
        <div className="rp-journey-summary">
          {groups.map((grp, gi) => {
            const grpDone = grp.filter((n) => progress[n.id]).length;
            const color = PHASE_COLORS[gi % PHASE_COLORS.length];
            const label = grp.length === 1 ? grp[0].tag : `${grp[0].tag} – ${grp[grp.length-1].tag}`;
            return (
              <div key={gi} className="rp-phase-summary" style={{ "--phase-accent": color.accent, "--phase-border": color.border }}>
                <div className="rp-phase-summary-tag">Weeks {gi * groupSize + 1}–{Math.min((gi + 1) * groupSize, nodes.length)}</div>
                <strong>{label}</strong>
                <span>{grpDone}/{grp.length} weeks complete</span>
                <div className="rp-phase-summary-bar"><div style={{ width: grp.length ? `${Math.round(grpDone/grp.length*100)}%` : "0%", background: color.accent }}/></div>
              </div>
            );
          })}
        </div>

        {/* Track */}
        <div className="rp-journey-track">
          <div className="rp-track-line"/>
          <div className="rp-track-scroll">
            <div className="rp-track-row">
              {nodes.map((node, index) => {
                const done = !!progress[node.id];
                return (
                  <motion.div key={node.id} className={`rp-track-node${index % 2 ? " lower" : " upper"}${done ? " done" : ""}`}
                    style={{ "--node-accent": node.color.accent, "--node-border": node.color.border }}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: index * 0.04 }}>
                    <div className="rp-track-node-anchor">
                      <button type="button" className="rp-track-dot" onClick={() => handleSelect(node)}><span/></button>
                    </div>
                    <button ref={(el) => { cardRefs.current[node.id] = el; }} type="button" className="rp-track-card" onClick={() => handleSelect(node)}>
                      <div className="rp-track-card-top">
                        <span className="rp-track-phase">{node.tag}</span>
                        <span className={`rp-track-state${done ? " done" : ""}`}>{done ? "Done" : "Open"}</span>
                      </div>
                      <div className="rp-track-title">{node.label}</div>
                      <div className="rp-track-meta">
                        <span>{node.week.topics_to_cover?.length || 0} topics</span>
                        <span>{node.week.practice_goals?.length || 0} practice</span>
                      </div>
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: node.color.accent, opacity: 0.7 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 5h3M5 3.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        View Details
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ProjectsTrackPanel ───────────────────────────────────────────────────────
function ProjectsTrackPanel({ projects, progress, setProgress }) {
  const LVL_COLOR = { beginner: { accent: "#4ade80", border: "rgba(74,222,128,0.28)" }, intermediate: { accent: "var(--accent)", border: "var(--accent-border)" }, advanced: { accent: "#f97316", border: "rgba(249,115,22,0.28)" } };
  const nodes = ["beginner", "intermediate", "advanced"].flatMap((lvl) =>
    (projects[lvl] || []).map((p, i) => ({
      id: `project-${lvl}-${i}`, idx: i, lvl, project: p,
      label: p.title || `Project ${i + 1}`,
      meta: `${p.features?.length || 0} features · ${p.core_topics_used?.length || 0} tech`,
      color: LVL_COLOR[lvl],
    }))
  );

  const [selectedId, setSelectedId] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const cardRefs = useRef({});

  const handleSelect = (node) => {
    const el = cardRefs.current[node.id];
    if (el) setOriginRect(el.getBoundingClientRect());
    setSelectedId(selectedId === node.id ? null : node.id);
  };

  if (!nodes.length) return null;

  const lvlGroups = ["beginner","intermediate","advanced"].map((lvl) => {
    const grp = nodes.filter((n) => n.lvl === lvl);
    return { lvl, grp, done: grp.filter((n) => progress[n.id]).length, color: LVL_COLOR[lvl] };
  }).filter((g) => g.grp.length > 0);

  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;

  return (
    <>
      {selectedNode && (
        <AnimatePresence>
          <motion.div key="proj-overlay"
            initial={{ opacity: 0, scale: 0.92, x: originRect ? originRect.left + originRect.width/2 - window.innerWidth/2 : 0, y: originRect ? originRect.top + originRect.height/2 - window.innerHeight/2 : 0, borderRadius: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, borderRadius: 0 }}
            exit={{ opacity: 0, scale: 0.94, borderRadius: 24 }}
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "var(--bg)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 55% 45% at 5% 0%, rgba(90,62,180,0.16) 0%, transparent 60%)" }}/>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(167,139,250,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.02) 1px,transparent 1px)", backgroundSize: "64px 64px" }}/>

            {/* Top bar */}
            <div style={{ flexShrink: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--bg) 85%, transparent)", backdropFilter: "blur(20px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setSelectedId(null)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-raised)", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.12em", transition: "all 0.18s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent-bright)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--bg-raised)"; }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7.5 1.5L3 5.5l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  BACK
                </button>
                <span style={{ color: "var(--text-faint)", fontSize: 10 }}>›</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.2em", color: selectedNode.color.accent, textTransform: "uppercase" }}>{selectedNode.lvl}</span>
                <span style={{ color: "var(--text-faint)", fontSize: 10 }}>›</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", color: "var(--text-dim)" }}>{selectedNode.label}</span>
              </div>
              <button onClick={() => setProgress((p) => ({ ...p, [selectedNode.id]: !progress[selectedNode.id] }))}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 10, cursor: "pointer", border: `1px solid ${progress[selectedNode.id] ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.1)"}`, background: progress[selectedNode.id] ? "rgba(74,222,128,0.1)" : "var(--bg-raised)", color: progress[selectedNode.id] ? "#4ade80" : "var(--text-muted)", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.1em", transition: "all 0.2s" }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${progress[selectedNode.id] ? "#4ade80" : "var(--text-faint)"}`, background: progress[selectedNode.id] ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {progress[selectedNode.id] && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="var(--bg)" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                </span>
                {progress[selectedNode.id] ? "COMPLETED" : "MARK DONE"}
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 48px 80px" }}>
                <div style={{ marginBottom: 12, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.22em", color: "var(--text-faint)", textTransform: "uppercase" }}>Projects · {selectedNode.lvl}</div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,4.5vw,58px)", fontWeight: 800, lineHeight: 0.96, color: "var(--text-heading)", margin: "0 0 16px", letterSpacing: "-0.02em" }}>{selectedNode.label.toUpperCase()}</h1>
                {selectedNode.project.description && <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, margin: "0 0 32px", maxWidth: 580, fontFamily: "'DM Sans',sans-serif" }}>{selectedNode.project.description}</p>}

                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {selectedNode.project.features?.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#60a5fa" }}>◎</div>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-heading)" }}>Features</span>
                        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(96,165,250,0.3),transparent)" }}/>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 9 }}>
                        {selectedNode.project.features.map((f, fi) => (
                          <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 13, background: "var(--bg-surface)", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "13px 0 0 13px", background: "linear-gradient(to bottom,rgba(96,165,250,0.5),rgba(96,165,250,0.12))" }}/>
                            <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#60a5fa", fontWeight: 600 }}>{String(fi+1).padStart(2,"0")}</div>
                            <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{String(f)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedNode.project.core_topics_used?.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${selectedNode.color.accent}12`, border: `1px solid ${selectedNode.color.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: selectedNode.color.accent }}>⬡</div>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-heading)" }}>Tech Stack</span>
                        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${selectedNode.color.accent}30,transparent)` }}/>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {selectedNode.project.core_topics_used.map((t, ti) => (
                          <span key={ti} style={{ padding: "6px 14px", borderRadius: 999, background: `${selectedNode.color.accent}0d`, border: `1px solid ${selectedNode.color.accent}30`, fontFamily: "'DM Mono',monospace", fontSize: 10, color: selectedNode.color.accent }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="rp-journey-wrap">
        {/* Summary strip */}
        <div className="rp-journey-summary">
          {lvlGroups.map(({ lvl, grp, done, color }) => (
            <div key={lvl} className="rp-phase-summary" style={{ "--phase-accent": color.accent, "--phase-border": color.border }}>
              <div className="rp-phase-summary-tag" style={{ textTransform: "capitalize" }}>{lvl}</div>
              <strong>{grp.length} Project{grp.length !== 1 ? "s" : ""}</strong>
              <span>{done}/{grp.length} completed</span>
              <div className="rp-phase-summary-bar"><div style={{ width: grp.length ? `${Math.round(done/grp.length*100)}%` : "0%", background: color.accent }}/></div>
            </div>
          ))}
        </div>

        {/* Track */}
        <div className="rp-journey-track">
          <div className="rp-track-line"/>
          <div className="rp-track-scroll">
            <div className="rp-track-row">
              {nodes.map((node, index) => {
                const done = !!progress[node.id];
                return (
                  <motion.div key={node.id} className={`rp-track-node${index % 2 ? " lower" : " upper"}${done ? " done" : ""}`}
                    style={{ "--node-accent": node.color.accent, "--node-border": node.color.border }}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: index * 0.04 }}>
                    <div className="rp-track-node-anchor">
                      <button type="button" className="rp-track-dot" onClick={() => handleSelect(node)}><span/></button>
                    </div>
                    <button ref={(el) => { cardRefs.current[node.id] = el; }} type="button" className="rp-track-card" onClick={() => handleSelect(node)}>
                      <div className="rp-track-card-top">
                        <span className="rp-track-phase" style={{ textTransform: "capitalize" }}>{node.lvl}</span>
                        <span className={`rp-track-state${done ? " done" : ""}`}>{done ? "Done" : "Open"}</span>
                      </div>
                      <div className="rp-track-title">{node.label.toUpperCase()}</div>
                      <div className="rp-track-meta">
                        <span>{node.project.features?.length || 0} features</span>
                        <span>{node.project.core_topics_used?.length || 0} tech</span>
                      </div>
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: node.color.accent, opacity: 0.7 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 5h3M5 3.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        View Details
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── InterviewTrackPanel ──────────────────────────────────────────────────────
function InterviewTrackPanel({ interview, progress, setProgress }) {
  const nodes = interview.map((s, i) => ({
    id: `interview-${i}`, idx: i, stage: s,
    label: s.stage || `Stage ${i + 1}`,
    meta: `${s.focus_areas?.length || 0} areas · ${s.common_questions?.length || 0} questions`,
    color: PHASE_COLORS[i % PHASE_COLORS.length],
  }));

  const [selectedId, setSelectedId] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const cardRefs = useRef({});

  const handleSelect = (node) => {
    const el = cardRefs.current[node.id];
    if (el) setOriginRect(el.getBoundingClientRect());
    setSelectedId(selectedId === node.id ? null : node.id);
  };

  if (!nodes.length) return null;

  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;

  return (
    <>
      {selectedNode && (
        <AnimatePresence>
          <motion.div key="iv-overlay"
            initial={{ opacity: 0, scale: 0.92, x: originRect ? originRect.left + originRect.width/2 - window.innerWidth/2 : 0, y: originRect ? originRect.top + originRect.height/2 - window.innerHeight/2 : 0, borderRadius: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, borderRadius: 0 }}
            exit={{ opacity: 0, scale: 0.94, borderRadius: 24 }}
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 2000, background: "var(--bg)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 55% 45% at 5% 0%, rgba(90,62,180,0.16) 0%, transparent 60%)" }}/>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(167,139,250,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.02) 1px,transparent 1px)", backgroundSize: "64px 64px" }}/>

            {/* Top bar */}
            <div style={{ flexShrink: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--bg) 85%, transparent)", backdropFilter: "blur(20px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setSelectedId(null)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-raised)", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.12em", transition: "all 0.18s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent-bright)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--bg-raised)"; }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7.5 1.5L3 5.5l4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  BACK
                </button>
                <span style={{ color: "var(--text-faint)", fontSize: 10 }}>›</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.2em", color: selectedNode.color.accent, textTransform: "uppercase" }}>Stage {String(selectedNode.idx + 1).padStart(2,"0")}</span>
                <span style={{ color: "var(--text-faint)", fontSize: 10 }}>›</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", color: "var(--text-dim)" }}>{selectedNode.label}</span>
              </div>
              <button onClick={() => setProgress((p) => ({ ...p, [selectedNode.id]: !progress[selectedNode.id] }))}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 10, cursor: "pointer", border: `1px solid ${progress[selectedNode.id] ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.1)"}`, background: progress[selectedNode.id] ? "rgba(74,222,128,0.1)" : "var(--bg-raised)", color: progress[selectedNode.id] ? "#4ade80" : "var(--text-muted)", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.1em", transition: "all 0.2s" }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${progress[selectedNode.id] ? "#4ade80" : "var(--text-faint)"}`, background: progress[selectedNode.id] ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {progress[selectedNode.id] && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="var(--bg)" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                </span>
                {progress[selectedNode.id] ? "COMPLETED" : "MARK DONE"}
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 48px 80px" }}>
                <div style={{ marginBottom: 12, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.22em", color: "var(--text-faint)", textTransform: "uppercase" }}>Interview Prep · Stage {String(selectedNode.idx + 1).padStart(2,"0")}</div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,4.5vw,58px)", fontWeight: 800, lineHeight: 0.96, color: "var(--text-heading)", margin: "0 0 24px", letterSpacing: "-0.02em" }}>{selectedNode.label.toUpperCase()}</h1>

                {selectedNode.stage.focus_areas?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
                    {selectedNode.stage.focus_areas.map((a, ai) => (
                      <span key={ai} style={{ padding: "5px 12px", borderRadius: 999, background: `${selectedNode.color.accent}10`, border: `1px solid ${selectedNode.color.accent}28`, fontFamily: "'DM Mono',monospace", fontSize: 9, color: selectedNode.color.accent }}>{String(a)}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {selectedNode.stage.common_questions?.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent-dim)", border: "1px solid rgba(167,139,250,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "var(--accent)" }}>?</div>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-heading)" }}>Common Questions</span>
                        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(167,139,250,0.3),transparent)" }}/>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                        {selectedNode.stage.common_questions.map((q, qi) => (
                          <div key={qi} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 15px", borderRadius: 13, background: "var(--bg-surface)", border: "1px solid var(--border)", position: "relative", overflow: "hidden", transition: "all 0.18s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-surface)"; }}>
                            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "13px 0 0 13px", background: "linear-gradient(to bottom,rgba(167,139,250,0.6),rgba(167,139,250,0.15))" }}/>
                            <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, background: "var(--accent-dim)", border: "1px solid rgba(167,139,250,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono',monospace", fontSize: 8, color: "var(--accent)", fontWeight: 600 }}>Q{qi+1}</div>
                            <span style={{ fontSize: 13.5, color: "var(--text-heading)", lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{String(q)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedNode.stage.mock_strategy && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 18px", borderRadius: 16, background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.2)", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "16px 0 0 16px", background: "linear-gradient(to bottom,rgba(251,146,60,0.6),rgba(251,146,60,0.15))" }}/>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>💡</div>
                      <div><div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", color: "rgba(251,146,60,0.6)", textTransform: "uppercase", marginBottom: 5 }}>Mock Strategy</div><div style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{selectedNode.stage.mock_strategy}</div></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="rp-journey-wrap">
        {/* Summary strip */}
        <div className="rp-journey-summary">
          {nodes.map((node) => {
            const done = !!progress[node.id];
            return (
              <div key={node.id} className="rp-phase-summary" style={{ "--phase-accent": node.color.accent, "--phase-border": node.color.border }}>
                <div className="rp-phase-summary-tag">Stage {String(node.idx + 1).padStart(2,"0")}</div>
                <strong>{node.label}</strong>
                <span>{done ? "1/1 complete" : "0/1 complete"}</span>
                <div className="rp-phase-summary-bar"><div style={{ width: done ? "100%" : "0%", background: node.color.accent }}/></div>
              </div>
            );
          })}
        </div>

        {/* Track */}
        <div className="rp-journey-track">
          <div className="rp-track-line"/>
          <div className="rp-track-scroll">
            <div className="rp-track-row">
              {nodes.map((node, index) => {
                const done = !!progress[node.id];
                return (
                  <motion.div key={node.id} className={`rp-track-node${index % 2 ? " lower" : " upper"}${done ? " done" : ""}`}
                    style={{ "--node-accent": node.color.accent, "--node-border": node.color.border }}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: index * 0.04 }}>
                    <div className="rp-track-node-anchor">
                      <button type="button" className="rp-track-dot" onClick={() => handleSelect(node)}><span/></button>
                    </div>
                    <button ref={(el) => { cardRefs.current[node.id] = el; }} type="button" className="rp-track-card" onClick={() => handleSelect(node)}>
                      <div className="rp-track-card-top">
                        <span className="rp-track-phase">STG {String(node.idx + 1).padStart(2,"0")}</span>
                        <span className={`rp-track-state${done ? " done" : ""}`}>{done ? "Done" : "Open"}</span>
                      </div>
                      <div className="rp-track-title">{node.label.toUpperCase()}</div>
                      <div className="rp-track-meta">
                        <span>{node.stage.focus_areas?.length || 0} areas</span>
                        <span>{node.stage.common_questions?.length || 0} questions</span>
                      </div>
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: node.color.accent, opacity: 0.7 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 5h3M5 3.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                        View Details
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SidePanel ────────────────────────────────────────────────────────────────
function SidePanel({ open, onClose, navigate, level, yearsOfExperience, timePerDay, duration, phases, weekly, pct, counts, sectionDone, tab, setTab, saving, raw, role }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const NAV_LINKS = [
    { label: "Dashboard", path: "/dashboard", icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg>
    )},
    { label: "Generate", path: "/generate", icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
    )},
    { label: "Mock Test", path: "/mocktest", icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
    )},
    { label: "Account", path: "/account", icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
    )},
    { label: "Settings", path: "/settings", icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg>
    )},
  ];

  const LEVEL_COLORS = { advanced: "#f97316", intermediate: "var(--accent)", beginner: "#4ade80" };
  const levelColor = LEVEL_COLORS[level?.toLowerCase?.()] || "var(--accent)";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="sp-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "color-mix(in srgb, var(--bg) 75%, transparent)", backdropFilter: "blur(8px)", zIndex: 1100 }}
          />

          <motion.aside key="sp-drawer"
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
            style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 340, zIndex: 1200, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", inset: 0, background: "var(--bg-overlay, linear-gradient(160deg, var(--bg) 0%, var(--bg-surface) 100%))", borderRight: "1px solid var(--border)", boxShadow: "28px 0 90px rgba(0,0,0,0.7)" }}/>
            <div style={{ position: "absolute", top: -100, left: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.09) 0%, transparent 70%)", pointerEvents: "none" }}/>
            <div style={{ position: "absolute", bottom: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)", pointerEvents: "none" }}/>

            <div style={{ position: "relative", padding: "20px 22px 18px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "4px 2px" }}>
                  <div style={{ width: 20, height: 1.5, background: "var(--text-dim)", borderRadius: 1 }}/>
                  <div style={{ width: 20, height: 1.5, background: "var(--text-dim)", borderRadius: 1 }}/>
                  <div style={{ width: 13, height: 1.5, background: "var(--text-dim)", borderRadius: 1 }}/>
                </div>
                <button onClick={onClose}
                  style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-raised)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: 15, transition: "all 0.18s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border)"; e.currentTarget.style.color = "var(--text-heading)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text-dim)"; }}
                >✕</button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <ProgressRing pct={pct} size={56}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.16em", color: "var(--text-dim)", textTransform: "uppercase" }}>Career Roadmap</span>
                    {level && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.12em", padding: "2px 7px", borderRadius: 999, background: `${levelColor}16`, border: `1px solid ${levelColor}35`, color: levelColor, textTransform: "uppercase" }}>{level}</span>}
                    {saving && <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Mono',monospace", fontSize: 8, color: "var(--accent-border)" }}><div style={{ width: 5, height: 5, borderRadius: "50%", border: "1.5px solid rgba(167,139,250,0.3)", borderTopColor: "var(--accent)", animation: "spin .7s linear infinite" }}/>Saving</span>}
                  </div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-heading)", lineHeight: 1.1, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(raw?.title || role || "Roadmap").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ position: "relative", flex: 1, overflowY: "auto", overflowX: "hidden" }}>
              <style>{`.sp-scroll::-webkit-scrollbar{width:4px}.sp-scroll::-webkit-scrollbar-track{background:transparent}.sp-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}`}</style>

              <div style={{ padding: "20px 20px 8px" }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.22em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 8, paddingLeft: 2 }}>Navigation</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {NAV_LINKS.map((item) => (
                    <button key={item.path}
                      onClick={() => { onClose(); navigate(item.path); }}
                      style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid transparent", background: "transparent", color: "var(--text-muted)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.16s", textAlign: "left" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-dim)"; e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent-bright)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--bg-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { onClose(); navigate(-1); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-dim)", fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.16s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  Back
                </button>
              </div>

              <div style={{ height: 1, background: "var(--bg-raised)", margin: "12px 20px" }}/>

              <div style={{ padding: "0 20px 8px" }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.22em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 8, paddingLeft: 2 }}>Sections</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {ROADMAP_TABS.map((t) => {
                    const total = counts[t];
                    const done = sectionDone[t];
                    const isActive = tab === t;
                    const allDoneSection = done === total && total > 0;
                    return (
                      <button key={t}
                        onClick={() => { setTab(t); onClose(); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 14px", borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", textAlign: "left", border: isActive ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.05)", background: isActive ? "linear-gradient(135deg,rgba(167,139,250,0.13),rgba(96,165,250,0.08))" : "var(--bg-raised)", color: isActive ? "var(--accent-bright)" : "var(--text-dim)", transition: "all 0.18s", boxShadow: isActive ? "0 4px 16px rgba(167,139,250,0.1)" : "none" }}
                        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text-muted)"; } }}
                        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.color = "var(--text-dim)"; } }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: isActive ? "var(--accent)" : allDoneSection ? "#4ade80" : "var(--text-faint)", transition: "background 0.2s", boxShadow: isActive ? "0 0 6px rgba(167,139,250,0.6)" : "none" }}/>
                        <span style={{ flex: 1 }}>{t}</span>
                        {total > 0 && (
                          <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 600, background: allDoneSection ? "rgba(74,222,128,0.12)" : isActive ? "var(--accent-border)" : "var(--border)", color: allDoneSection ? "#4ade80" : isActive ? "var(--accent)" : "var(--text-dim)", border: `1px solid ${allDoneSection ? "rgba(74,222,128,0.25)" : isActive ? "var(--accent-border)" : "var(--border)"}` }}>
                            {done}/{total}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ height: 1, background: "var(--bg-raised)", margin: "12px 20px" }}/>

              <div style={{ padding: "0 20px 24px" }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.22em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 10, paddingLeft: 2 }}>Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  {[
                    { label: "Level",      value: level || "Custom" },
                    { label: "Experience", value: yearsOfExperience || "—" },
                    { label: "Daily",      value: timePerDay || "—" },
                    { label: "Duration",   value: duration || "—" },
                    { label: "Phases",     value: phases.length },
                    { label: "Weeks",      value: weekly.length || "—" },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: "11px 13px", borderRadius: 11, border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-muted)" }}>{String(s.value).toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 7, padding: "13px 15px", borderRadius: 11, border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 9 }}>Overall Progress</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: pct >= 100 ? "#4ade80" : pct >= 60 ? "var(--accent)" : "#60a5fa", transition: "width 0.5s ease" }}/>
                    </div>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: pct >= 100 ? "#4ade80" : pct >= 60 ? "var(--accent)" : "#60a5fa", minWidth: 38, textAlign: "right" }}>{pct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── RoadmapPage ──────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [raw,        setRaw]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [tab,        setTab]        = useState("PHASES");
  const [progress,   setProgress]   = useState({});
  const [saving,     setSaving]     = useState(false);
  const [panelOpen,  setPanelOpen]  = useState(false);
  const saveTimer = useRef(null);
  useTheme(); // subscribes to theme changes, triggers re-render on theme switch

  const fetchRoadmap = useCallback(async () => {
    setLoading(true); setError(null);
    try { const d = await getRoadmapById(id); setRaw(d); }
    catch (err) { setError(err?.response?.data?.message || err?.message || "Failed to load"); }
    finally { setLoading(false); }
  }, [id]);

  const fetchProgress = useCallback(async () => {
    try { const data = await getProgress(id); if (data && typeof data === "object" && Object.keys(data).length) { setProgress(data); return; } } catch {}
    const local = loadLocalProgress(id); if (local) setProgress(local);
  }, [id]);

  useEffect(() => { fetchRoadmap(); fetchProgress(); }, [fetchRoadmap, fetchProgress]);

  useEffect(() => {
    if (!Object.keys(progress).length) return;
    saveLocalProgress(id, progress);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try { await saveProgress(id, progress); } catch {}
      finally { setSaving(false); }
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [progress, id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 18, height: 18, border: "2px solid rgba(167,139,250,0.18)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin .7s linear infinite" }}/>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.18em", color: "var(--text-faint)" }}>LOADING ROADMAP...</span>
    </div>
  );

  const roadmap           = normalizeRoadmap(raw?.roadmap ?? raw);
  const level             = raw?.level ?? "";
  const role              = raw?.role ?? raw?.roadmap?.role ?? "Career";
  const timePerDay        = raw?.timePerDay ?? "";
  const duration          = raw?.duration ?? "";
  const yearsOfExperience = raw?.yearsOfExperience ?? "";
  const phases            = roadmap?.phases ?? [];
  const weekly            = roadmap?.weekly_plan ?? [];
  const projects          = roadmap?.projects ?? {};
  const interview         = roadmap?.interview_preparation ?? [];
  const allProjects       = ["beginner", "intermediate", "advanced"].flatMap((l) => (projects[l] || []).map((_, i) => ({ lvl: l, i })));
  const pct               = calcOverallPercent(progress, phases, weekly, projects, interview);
  const counts            = { PHASES: phases.length, WEEKLY: weekly.length, PROJECTS: allProjects.length, INTERVIEW: interview.length };

  const topicTotal = phases.flatMap((p, pi) => p.topics.map((_, ti) => `phase-${pi}-topic-${ti}`));
  const weekTotal  = weekly.flatMap((w, i) => { const k = [`week-${i}`]; (w.topics_to_cover||[]).forEach((_,j)=>k.push(`week-${i}-topic-${j}`)); (w.practice_goals||[]).forEach((_,j)=>k.push(`week-${i}-practice-${j}`)); return k; });
  const projTotal  = allProjects.map((p) => `project-${p.lvl}-${p.i}`);
  const ivTotal    = interview.map((_, i) => `interview-${i}`);
  const sectionDone = {
    PHASES:    topicTotal.filter((k) => progress[k]).length,
    WEEKLY:    weekTotal.filter((k) => progress[k]).length,
    PROJECTS:  projTotal.filter((k) => progress[k]).length,
    INTERVIEW: ivTotal.filter((k) => progress[k]).length,
  };

  const LEVEL_COLORS = { advanced: "#f97316", intermediate: "var(--accent)", beginner: "#4ade80" };
  const levelColor = LEVEL_COLORS[level?.toLowerCase?.()] || "var(--accent)";
  const currentTabDone = sectionDone[tab];
  const currentTabTotal = counts[tab];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes spin   { to { transform:rotate(360deg) } }
        *, *::before, *::after { box-sizing: border-box; }

        .rp-root {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 68% 44% at 6% 0%, var(--accent-dim) 0%, transparent 58%),
            radial-gradient(ellipse 50% 36% at 94% 100%, var(--accent-dim) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          padding: calc(var(--navbar-height, 56px) + 6px) 0 100px;
        }

        .rp-grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 1;
          background-image:
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
          background-size: 68px 68px;
        }

        .rp-page { max-width: 1600px; margin: 0 auto; padding: 0 32px; position: relative; z-index: 1; }

        .rp-topbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: 24px;
          padding: 14px 20px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          backdrop-filter: blur(16px);
        }
        .rp-topbar-left { display: flex; align-items: center; gap: 14px; }
        .rp-topbar-right { display: flex; align-items: center; gap: 10px; }

        .rp-menu-btn {
          width: 42px; height: 42px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.09);
          background: var(--bg-raised);
          cursor: pointer; display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 4px; padding: 0;
          transition: all 0.2s;
        }
        .rp-menu-btn:hover { border-color: rgba(167,139,250,0.35); background: rgba(167,139,250,0.09); }
        .rp-menu-btn span { display: block; height: 1.5px; background: rgba(255,255,255,0.55); border-radius: 1px; transition: all 0.2s; }
        .rp-menu-btn span:nth-child(1) { width: 18px; }
        .rp-menu-btn span:nth-child(2) { width: 18px; }
        .rp-menu-btn span:nth-child(3) { width: 11px; }
        .rp-menu-btn:hover span { background: #c4b8ff; }

        .rp-title-block { display: flex; flex-direction: column; gap: 3px; }
        .rp-tab-pills { display: flex; align-items: center; gap: 6px; }
        .rp-tab-pill {
          height: 34px; padding: 0 14px; border-radius: 999px;
          border: 1px solid var(--border); background: var(--bg-raised);
          color: var(--text-dim); font-family: 'DM Mono', monospace; font-size: 9px;
          font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; display: flex; align-items: center; gap: 7px;
          transition: all 0.18s; white-space: nowrap;
        }
        .rp-tab-pill:hover { color: rgba(255,255,255,0.65); border-color: rgba(255,255,255,0.13); }
        .rp-tab-pill.active {
          border-color: rgba(167,139,250,0.32);
          background: linear-gradient(135deg, rgba(167,139,250,0.13), rgba(96,165,250,0.08));
          color: #d0c8ff; box-shadow: 0 2px 12px rgba(167,139,250,0.12);
        }
        .rp-pill-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; transition: background 0.2s; }
        .rp-progress-chip {
          display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 13px;
          border-radius: 999px; border: 1px solid var(--border);
          background: var(--bg-surface); font-family: 'DM Mono', monospace;
          font-size: 10px; color: var(--text-dim);
        }

        .rp-card { border: 1px solid var(--border); border-radius: 26px; background: var(--bg-surface); backdrop-filter: blur(20px); overflow: hidden; }
        .rp-card-body { padding: 32px 36px 48px; }

        .section-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--text-heading); letter-spacing: -0.01em; margin-bottom: 6px; }
        .section-sub { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.16em; color: var(--text-faint); text-transform: uppercase; margin-bottom: 28px; }

        .rp-journey-wrap { display: grid; gap: 30px; }
        .rp-journey-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .rp-phase-summary { padding: 16px 18px; border-radius: 16px; border: 1px solid var(--phase-border); background: var(--bg-surface); }
        .rp-phase-summary-tag { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--phase-accent); margin-bottom: 8px; }
        .rp-phase-summary strong { display: block; font-family: 'Syne',sans-serif; font-size: 15px; line-height: 1.2; color: var(--text-heading); margin-bottom: 6px; }
        .rp-phase-summary span { display: block; font-size: 11px; color: rgba(255,255,255,0.42); }
        .rp-phase-summary-bar { height: 4px; margin-top: 12px; border-radius: 999px; background: rgba(255,255,255,0.07); overflow: hidden; }
        .rp-phase-summary-bar div { height: 100%; border-radius: inherit; transition: width 0.45s ease; }

        .rp-journey-track { position: relative; padding: 34px 0 20px; border-radius: 24px; border: 1px solid var(--border); background: var(--bg-raised); overflow: hidden; }
        .rp-track-line { position: absolute; left: 40px; right: 40px; top: 50%; height: 2px; transform: translateY(-1px); background: linear-gradient(90deg, rgba(96,165,250,0.2), var(--accent-border), rgba(251,146,60,0.2)); pointer-events: none; }
        .rp-track-scroll { overflow-x: auto; overflow-y: hidden; padding: 8px 0; }
        .rp-track-scroll::-webkit-scrollbar { height: 6px; }
        .rp-track-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
        .rp-track-row { min-width: max-content; padding: 0 38px; display: flex; align-items: center; gap: 34px; }
        .rp-track-node { position: relative; width: 240px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .rp-track-node.upper { padding-bottom: 170px; }
        .rp-track-node.lower { padding-top: 170px; flex-direction: column-reverse; }
        .rp-track-node-anchor { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; }
        .rp-track-dot { width: 22px; height: 22px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; background: transparent; display: grid; place-items: center; }
        .rp-track-dot span { width: 16px; height: 16px; border-radius: 50%; background: var(--node-accent); box-shadow: 0 0 0 5px rgba(8,6,15,0.98), 0 0 0 7px var(--node-border); transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; }
        .rp-track-node.active .rp-track-dot span { transform: scale(1.16); }
        .rp-track-node.done .rp-track-dot span { box-shadow: 0 0 0 5px rgba(8,6,15,0.98), 0 0 0 7px rgba(74,222,128,0.28); }
        .rp-track-node.locked .rp-track-dot { cursor: not-allowed; }
        .rp-track-node.locked .rp-track-dot span { opacity: 0.45; }

        .rp-track-card { width: 100%; min-height: 132px; padding: 16px; border-radius: 18px; border: 1px solid var(--border); background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); text-align: left; cursor: pointer; color: inherit; transition: transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease; }
        .rp-track-card:hover { transform: translateY(-3px); border-color: var(--node-border); }
        .rp-track-node.active .rp-track-card { border-color: var(--node-border); box-shadow: 0 18px 42px rgba(0,0,0,0.3); }
        .rp-track-node.locked .rp-track-card { opacity: 0.58; cursor: not-allowed; }
        .rp-track-node.locked .rp-track-card:hover { transform: none; }
        .rp-track-card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .rp-track-phase { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--node-accent); }
        .rp-track-state { padding: 2px 8px; border-radius: 999px; background: rgba(255,255,255,0.06); color: var(--text-dim); font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.08em; text-transform: uppercase; }
        .rp-track-state.done { color: #4ade80; background: rgba(74,222,128,0.12); }
        .rp-track-state.locked { color: rgba(255,255,255,0.24); }
        .rp-track-title { margin: 14px 0 10px; font-family: 'Syne',sans-serif; font-size: 16px; font-weight: 800; line-height: 1.15; color: var(--text-heading); }
        .rp-track-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 11px; color: var(--text-dim); line-height: 1.4; }
        .rp-track-lock { display: flex; align-items: center; gap: 8px; margin-top: 12px; color: var(--text-dim); font-size: 11px; }

        .week-item { display: grid; grid-template-columns: 52px 1fr; margin-bottom: 4px; position: relative; }
        .week-item::after { content: ''; position: absolute; left: 25px; top: 56px; bottom: -4px; width: 1px; background: linear-gradient(to bottom, rgba(167,139,250,0.28), transparent); }
        .week-item:last-child::after { display: none; }
        .week-node { width: 38px; height: 38px; border-radius: 11px; margin-top: 18px; display: flex; align-items: center; justify-content: center; font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 600; position: relative; z-index: 1; }
        .week-body { padding: 18px 0 26px 20px; border-bottom: 1px solid var(--border); }
        .week-item:last-child .week-body { border-bottom: none; }

        .proj-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
        .proj-card { border-radius: 20px; border: 1px solid var(--border); background: var(--bg-surface); overflow: hidden; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
        .proj-card:hover { transform: translateY(-3px); box-shadow: 0 18px 44px rgba(0,0,0,0.35); }
        .proj-bar { height: 2px; }
        .proj-card.beginner    .proj-bar { background: linear-gradient(90deg,#4ade80,#86efac); }
        .proj-card.intermediate .proj-bar { background: linear-gradient(90deg,#a78bfa,#c4b5fd); }
        .proj-card.advanced     .proj-bar { background: linear-gradient(90deg,#f97316,#fb923c); }

        .iv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 14px; }
        .iv-card { border-radius: 20px; border: 1px solid var(--border); background: var(--bg-surface); overflow: hidden; transition: transform 0.2s, border-color 0.2s; }
        .iv-card:hover { transform: translateY(-2px); border-color: rgba(167,139,250,0.22); }

        @media (max-width: 860px) {
          .rp-page { padding: 0 16px; }
          .rp-tab-pills { overflow-x: auto; padding-bottom: 2px; }
          .rp-card-body { padding: 20px 18px 32px; }
          .rp-topbar { flex-wrap: wrap; }
          .rp-track-line { left: 18px; right: 18px; }
          .rp-track-row { padding: 0 18px; gap: 22px; }
          .rp-track-node { width: 220px; }
        }
      `}</style>

      <SidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        navigate={navigate}
        level={level}
        yearsOfExperience={yearsOfExperience}
        timePerDay={timePerDay}
        duration={duration}
        phases={phases}
        weekly={weekly}
        pct={pct}
        counts={counts}
        sectionDone={sectionDone}
        tab={tab}
        setTab={setTab}
        saving={saving}
        raw={raw}
        role={role}
      />

      <div className="rp-root">
        <div className="rp-grid-bg"/>
        <div className="rp-page">

          {/* ── Top bar ── */}
          <div className="rp-topbar">
            <div className="rp-topbar-left">
              <button className="rp-menu-btn" onClick={() => setPanelOpen(true)} aria-label="Open panel">
                <span/><span/><span/>
              </button>

              <div className="rp-title-block">
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.18em", color: "var(--text-dim)", textTransform: "uppercase" }}>Career Roadmap</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-heading)", lineHeight: 1, textTransform: "uppercase" }}>
                  {(raw?.title || role || "Roadmap").toUpperCase()}
                </div>
              </div>

              {level && (
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.12em", padding: "4px 10px", borderRadius: 999, background: `${levelColor}16`, border: `1px solid ${levelColor}35`, color: levelColor, textTransform: "uppercase" }}>{level}</span>
              )}
            </div>

            <div className="rp-topbar-right">
              <div className="rp-tab-pills">
                {ROADMAP_TABS.map((t) => {
                  const total = counts[t];
                  const done = sectionDone[t];
                  const isActive = tab === t;
                  const allDoneSection = done === total && total > 0;
                  return (
                    <button key={t} className={`rp-tab-pill${isActive ? " active" : ""}`} onClick={() => setTab(t)}>
                      <span className="rp-pill-dot" style={{ background: isActive ? "var(--accent)" : allDoneSection ? "#4ade80" : "var(--text-faint)", boxShadow: isActive ? "0 0 5px rgba(167,139,250,0.6)" : "none" }}/>
                      {t}
                      {total > 0 && (
                        <span style={{ padding: "1px 6px", borderRadius: 999, fontSize: 8, background: allDoneSection ? "rgba(74,222,128,0.15)" : isActive ? "var(--accent-border)" : "var(--border)", color: allDoneSection ? "#4ade80" : isActive ? "var(--accent-bright)" : "var(--text-dim)", border: `1px solid ${allDoneSection ? "rgba(74,222,128,0.25)" : isActive ? "var(--accent-border)" : "rgba(255,255,255,0.1)"}` }}>
                          {done}/{total}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="rp-progress-chip">
                <div style={{ width: 28, height: 28, flexShrink: 0, position: "relative" }}>
                  <svg width="28" height="28" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="14" cy="14" r="11" fill="none" stroke="var(--border)" strokeWidth="2.5"/>
                    <circle cx="14" cy="14" r="11" fill="none" stroke={pct >= 100 ? "#4ade80" : pct >= 60 ? "var(--accent)" : "#60a5fa"} strokeWidth="2.5" strokeDasharray={69.1} strokeDashoffset={69.1 - (69.1 * pct) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
                  </svg>
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono',monospace", fontSize: 7, fontWeight: 600, color: "var(--text-muted)" }}>{pct}</span>
                </div>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9 }}>{pct >= 100 ? "Done ✓" : `${pct}%`}</span>
              </div>

              {saving && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Mono',monospace", fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.1em" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", border: "1.5px solid rgba(167,139,250,0.25)", borderTopColor: "var(--accent)", animation: "spin .7s linear infinite" }}/>
                  Saving
                </span>
              )}
            </div>
          </div>

          {/* ── Content card ── */}
          <div className="rp-card">
            <div className="rp-card-body">
              {error && <div style={{ padding: "13px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 10, color: "var(--danger, #f87171)", fontSize: 12, marginBottom: 24 }}>✕ {error}</div>}

              {tab === "PHASES" && (
                <motion.div key="phases" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--accent-dim)", border: "1px solid rgba(167,139,250,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "var(--accent)", flexShrink: 0 }}>◎</div>
                    <div>
                      <div className="section-title" style={{ marginBottom: 0 }}>Learning Phases</div>
                      <div className="section-sub" style={{ marginBottom: 0 }}>{phases.length} phases · sequential unlocks · {currentTabDone}/{currentTabTotal} topics done</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "linear-gradient(90deg, rgba(167,139,250,0.35), var(--accent-dim), transparent)", margin: "16px 0 28px" }}/>
                  {phases.length
                    ? <PhaseRoadmapPanel phases={phases} progress={progress} setProgress={setProgress}/>
                    : <div style={{ textAlign: "center", padding: "64px", color: "var(--text-faint)", fontSize: 13 }}>No phase data available</div>
                  }
                </motion.div>
              )}

              {tab === "WEEKLY" && (
                <motion.div key="weekly" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--accent-dim)", border: "1px solid rgba(167,139,250,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "var(--accent)", flexShrink: 0 }}>◷</div>
                    <div>
                      <div className="section-title" style={{ marginBottom: 0 }}>Weekly Schedule</div>
                      <div className="section-sub" style={{ marginBottom: 0 }}>{weekly.length} weeks · click a card to view details</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "linear-gradient(90deg,rgba(167,139,250,0.35),var(--accent-dim),transparent)", margin: "16px 0 28px" }}/>
                  {weekly.length
                    ? <WeeklyTrackPanel weekly={weekly} progress={progress} setProgress={setProgress}/>
                    : <div style={{ textAlign: "center", padding: "64px", color: "var(--text-faint)", fontSize: 13 }}>No weekly plan available</div>
                  }
                </motion.div>
              )}
              {tab === "PROJECTS" && (
                <motion.div key="projects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#60a5fa", flexShrink: 0 }}>⬡</div>
                    <div>
                      <div className="section-title" style={{ marginBottom: 0 }}>Build Projects</div>
                      <div className="section-sub" style={{ marginBottom: 0 }}>{allProjects.length} projects · click a card to view details</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "linear-gradient(90deg,rgba(96,165,250,0.35),rgba(96,165,250,0.06),transparent)", margin: "16px 0 28px" }}/>
                  {Object.keys(projects).length
                    ? <ProjectsTrackPanel projects={projects} progress={progress} setProgress={setProgress}/>
                    : <div style={{ textAlign: "center", padding: "64px", color: "var(--text-faint)", fontSize: 13 }}>No projects available</div>
                  }
                </motion.div>
              )}

              {tab === "INTERVIEW" && (
                <motion.div key="interview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#fb923c", flexShrink: 0 }}>◈</div>
                    <div>
                      <div className="section-title" style={{ marginBottom: 0 }}>Interview Prep</div>
                      <div className="section-sub" style={{ marginBottom: 0 }}>{interview.length} stages · click a card to view details</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "linear-gradient(90deg,rgba(251,146,60,0.35),rgba(251,146,60,0.06),transparent)", margin: "16px 0 28px" }}/>
                  {interview.length
                    ? <InterviewTrackPanel interview={interview} progress={progress} setProgress={setProgress}/>
                    : <div style={{ textAlign: "center", padding: "64px", color: "var(--text-faint)", fontSize: 13 }}>No interview prep available</div>
                  }
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}