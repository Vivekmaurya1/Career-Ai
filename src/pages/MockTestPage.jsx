// src/pages/MockTestPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// ── API ──────────────────────────────────────────────────────────────────────
import mockAxios from "./../api/mocktestaxios";   // port 8081 — mock test service
import axios from "./../api/axios";                // port 8080 — main service (roadmap, auth)
import { generateRoadmap } from "./../api/roadmapApi";

const startMockTest  = (payload) =>
  mockAxios.post("/api/mocktest/start",  payload).then(r => r.data);
const submitMockTest = (payload) =>
  mockAxios.post("/api/mocktest/submit", payload).then(r => r.data);

// ── Constants ────────────────────────────────────────────────────────────────
const EXPERIENCE_OPTIONS = [
  { value: "0-6 months",  label: "< 6 months",  badge: "Fresher"   },
  { value: "6-12 months", label: "6–12 months", badge: "Junior"    },
  { value: "1-2 years",   label: "1–2 years",   badge: "Junior"    },
  { value: "2-4 years",   label: "2–4 years",   badge: "Mid-level" },
  { value: "4-7 years",   label: "4–7 years",   badge: "Senior"    },
  { value: "7+ years",    label: "7+ years",    badge: "Principal" },
];

const LEVEL_OPTIONS      = ["Beginner", "Intermediate", "Advanced"];
const TYPE_OPTIONS       = [
  { value: "mixed",   label: "Mixed",    desc: "20 MCQ + 5 Written" },
  { value: "quiz",    label: "MCQ Only", desc: "25 Multiple Choice" },
  { value: "writing", label: "Written",  desc: "25 Descriptive"     },
];
const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};
const stagger = { animate: { transition: { staggerChildren: 0.05 } } };

// ── Difficulty badge color ────────────────────────────────────────────────────
const diffColor = (d) =>
  ({
    easy:   { bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.3)",  text: "#4ade80" },
    medium: { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24" },
    hard:   { bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", text: "#f87171" },
  }[d?.toLowerCase()] ?? { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", text: "#94a3b8" });

// ── Helpers ───────────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div style={{ height: 4, borderRadius: 4, background: "var(--border)", overflow: "hidden" }}>
      <motion.div
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ height: "100%", background: "var(--accent)", borderRadius: 4 }}
      />
    </div>
  );
}

function CountdownTimer({ minutes, onExpire }) {
  const [secs, setSecs] = useState(minutes * 60);
  const fired = useRef(false);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => {
      if (s <= 1 && !fired.current) { fired.current = true; clearInterval(id); onExpire?.(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, []);
  const m   = Math.floor(secs / 60), s = secs % 60;
  const col = secs / (minutes * 60) > 0.5 ? "#4ade80" : secs / (minutes * 60) > 0.2 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, color: col, fontWeight: 700, display: "flex", gap: 6, alignItems: "center" }}>
      <span>⏱</span>
      <span>{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>
    </div>
  );
}

// ── MCQ card (quiz mode — answers hidden) ─────────────────────────────────────
function McqCard({ question, index, selected, onSelect }) {
  const dc = diffColor(question.difficulty);
  return (
    <motion.div variants={fadeUp} style={{
      marginBottom: 24, padding: "20px 22px", borderRadius: 12,
      background: "var(--surface)", border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
      transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)", fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 700,
        }}>{index}</div>
        <span style={{
          padding: "2px 10px", borderRadius: 12,
          background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text,
          fontFamily: "IBM Plex Mono, monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>{question.difficulty}</span>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>{question.topic}</span>
        <span style={{ marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>{question.points} pts</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)", fontFamily: "IBM Plex Mono, monospace", marginBottom: 14 }}>
        {question.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.options?.map(opt => {
          const isSel = selected === opt;
          return (
            <motion.button key={opt} onClick={() => onSelect(opt)}
              whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
              style={{
                padding: "9px 14px", borderRadius: 7, cursor: "pointer", textAlign: "left",
                background: isSel ? "rgba(99,102,241,0.1)" : "var(--bg)",
                border: `1px solid ${isSel ? "var(--accent)" : "var(--border)"}`,
                color: isSel ? "var(--accent)" : "var(--text)",
                fontFamily: "IBM Plex Mono, monospace", fontSize: 13, outline: "none",
                display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
              }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${isSel ? "var(--accent)" : "var(--border)"}`,
                background: isSel ? "var(--accent)" : "transparent", transition: "all 0.15s",
              }} />
              {opt}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── MCQ review card (result mode) ─────────────────────────────────────────────
function McqReviewCard({ question, index, userAnswer }) {
  const dc         = diffColor(question.difficulty);
  const correctAns = question.correctAnswer;
  const isCorrect  = userAnswer === correctAns;
  const isSkipped  = !userAnswer;
  return (
    <motion.div variants={fadeUp} style={{
      marginBottom: 24, padding: "20px 22px", borderRadius: 12,
      background: "var(--surface)",
      border: `1px solid ${isSkipped ? "var(--border)" : isCorrect ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          border: `1px solid ${isSkipped ? "var(--muted)" : isCorrect ? "#4ade80" : "#f87171"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isSkipped ? "var(--muted)" : isCorrect ? "#4ade80" : "#f87171",
          fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 700,
        }}>{index}</div>
        <span style={{
          padding: "2px 10px", borderRadius: 12,
          background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text,
          fontFamily: "IBM Plex Mono, monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>{question.difficulty}</span>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>{question.topic}</span>
        <span style={{
          marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace", fontSize: 11,
          color: isSkipped ? "var(--muted)" : isCorrect ? "#4ade80" : "#f87171", fontWeight: 600,
        }}>
          {isSkipped ? "Skipped · 0 pts" : isCorrect ? `✓ +${question.points} pts` : `✗ 0 pts`}
        </span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)", fontFamily: "IBM Plex Mono, monospace", marginBottom: 14 }}>
        {question.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.options?.map(opt => {
          const isCorrectOpt = opt === correctAns;
          const isUserPick   = opt === userAnswer;
          let bg = "var(--bg)", border = "var(--border)", color = "var(--text)", icon = null;
          if (isCorrectOpt)             { bg = "rgba(74,222,128,0.08)";  border = "rgba(74,222,128,0.5)";  color = "#4ade80"; icon = "✓"; }
          if (isUserPick && !isCorrect) { bg = "rgba(248,113,113,0.08)"; border = "rgba(248,113,113,0.5)"; color = "#f87171"; icon = "✗"; }
          return (
            <div key={opt} style={{
              padding: "9px 14px", borderRadius: 7, textAlign: "left",
              background: bg, border: `1px solid ${border}`, color,
              fontFamily: "IBM Plex Mono, monospace", fontSize: 13,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${border}`,
                background: isCorrectOpt || (isUserPick && !isCorrect) ? border : "transparent",
              }} />
              <span style={{ flex: 1 }}>{opt}</span>
              {icon && <span style={{ fontSize: 12, fontWeight: 700 }}>{icon}</span>}
              {isCorrectOpt && <span style={{ fontSize: 10, color: "#4ade80", fontFamily: "IBM Plex Mono, monospace" }}>CORRECT</span>}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Writing card (quiz mode) ──────────────────────────────────────────────────
function WritingCard({ question, index, value, onChange }) {
  const wc  = value.trim() ? value.trim().split(/\s+/).length : 0;
  const dc  = diffColor(question.difficulty);
  const kps = question.expectedKeyPoints ?? [];
  return (
    <motion.div variants={fadeUp} style={{
      marginBottom: 24, padding: "20px 22px", borderRadius: 12,
      background: "var(--surface)",
      border: `1px solid ${value?.trim() ? "#a78bfa55" : "var(--border)"}`,
      transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          border: "1px solid #a78bfa", display: "flex", alignItems: "center", justifyContent: "center",
          color: "#a78bfa", fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 700,
        }}>{index}</div>
        <span style={{
          padding: "2px 10px", borderRadius: 12,
          background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text,
          fontFamily: "IBM Plex Mono, monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>{question.difficulty}</span>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#a78bfa" }}>✍ Written</span>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>{question.topic}</span>
        <span style={{ marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>{question.points} pts</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)", fontFamily: "IBM Plex Mono, monospace", marginBottom: 12 }}>
        {question.question}
      </div>
      {kps.length > 0 && (
        <div style={{ padding: "10px 12px", borderRadius: 7, background: "var(--bg)", border: "1px solid var(--border)", marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            Key points to cover
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {kps.map((kp, i) => (
              <span key={i} style={{
                padding: "2px 8px", borderRadius: 10,
                background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa",
                fontFamily: "IBM Plex Mono, monospace", fontSize: 11,
              }}>{kp}</span>
            ))}
          </div>
        </div>
      )}
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder="Write your answer here... (aim for 80–150 words)"
        rows={5}
        style={{
          width: "100%", boxSizing: "border-box", background: "var(--bg)",
          border: `1px solid ${value ? "#a78bfa66" : "var(--border)"}`,
          borderRadius: 8, padding: "11px 13px", color: "var(--text)", fontSize: 13,
          fontFamily: "IBM Plex Mono, monospace", outline: "none", resize: "vertical",
          lineHeight: 1.65, transition: "border-color 0.2s",
        }}
      />
      <div style={{ marginTop: 5, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", color: wc >= 30 ? "#4ade80" : "var(--muted)" }}>
        {wc} words {wc > 0 && wc < 30 ? "· keep writing..." : wc >= 30 ? "· ✓ good" : ""}
      </div>
    </motion.div>
  );
}

// ── Writing review card (result mode) ────────────────────────────────────────
function WritingReviewCard({ question, index, userAnswer }) {
  const dc     = diffColor(question.difficulty);
  const kps    = question.expectedKeyPoints ?? [];
  const hasAns = userAnswer && userAnswer.trim().length > 0;
  return (
    <motion.div variants={fadeUp} style={{
      marginBottom: 24, padding: "20px 22px", borderRadius: 12,
      background: "var(--surface)",
      border: `1px solid ${hasAns ? "rgba(167,139,250,0.4)" : "var(--border)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          border: `1px solid ${hasAns ? "#a78bfa" : "var(--muted)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: hasAns ? "#a78bfa" : "var(--muted)",
          fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 700,
        }}>{index}</div>
        <span style={{
          padding: "2px 10px", borderRadius: 12,
          background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text,
          fontFamily: "IBM Plex Mono, monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>{question.difficulty}</span>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#a78bfa" }}>✍ Written</span>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>{question.topic}</span>
        <span style={{ marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: hasAns ? "#a78bfa" : "var(--muted)" }}>
          {hasAns ? "Answered" : "Skipped"}
        </span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)", fontFamily: "IBM Plex Mono, monospace", marginBottom: 12 }}>
        {question.question}
      </div>
      <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--bg)", border: `1px solid ${hasAns ? "rgba(167,139,250,0.3)" : "var(--border)"}`, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#a78bfa", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
          Your Answer
        </div>
        <div style={{ fontSize: 13, color: hasAns ? "var(--text)" : "var(--muted)", fontFamily: "IBM Plex Mono, monospace", lineHeight: 1.65, fontStyle: hasAns ? "normal" : "italic" }}>
          {hasAns ? userAnswer : "No answer provided"}
        </div>
      </div>
      {kps.length > 0 && (
        <div style={{ padding: "10px 12px", borderRadius: 7, background: "var(--bg)", border: "1px solid rgba(74,222,128,0.2)" }}>
          <div style={{ fontSize: 10, color: "#4ade80", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            Model Key Points
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {kps.map((kp, i) => (
              <span key={i} style={{
                padding: "2px 8px", borderRadius: 10,
                background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80",
                fontFamily: "IBM Plex Mono, monospace", fontSize: 11,
              }}>{kp}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Report card ───────────────────────────────────────────────────────────────
function ReportCard({ result, role, allQ, answers, onViewRoadmap, onGenerateRoadmap }) {
  const [showReview,        setShowReview]        = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapError,      setRoadmapError]      = useState(null);

  const levelMeta = {
    BEGINNER:     { color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.3)"  },
    INTERMEDIATE: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.3)"  },
    ADVANCED:     { color: "#818cf8", bg: "rgba(129,140,248,0.1)",  border: "rgba(129,140,248,0.35)" },
  };
  const readinessMeta = {
    "Not Ready":       { color: "#f87171", icon: "✗" },
    "Partially Ready": { color: "#fbbf24", icon: "◐" },
    "Ready":           { color: "#4ade80", icon: "✓" },
  };

  const lm = levelMeta[result.detectedLevel] ?? levelMeta.INTERMEDIATE;
  const rm = readinessMeta[result.interviewReadiness] ?? readinessMeta["Partially Ready"];

  const parseScore = (s) => {
    if (!s) return { pct: 0, raw: "0/0" };
    const parts = s.split("/");
    if (parts.length === 2) {
      const pct = Math.round((parseFloat(parts[0]) / parseFloat(parts[1])) * 100) || 0;
      return { pct, raw: s };
    }
    return { pct: parseInt(s) || 0, raw: s };
  };

  const overall = parseScore(result.overallScore);
  const mcq     = parseScore(result.mcqScore);
  const writing = parseScore(result.writingScore ?? result.codingScore);
  const mcqQ    = allQ.filter(q => q.type === "mcq");
  const writeQ  = allQ.filter(q => q.type === "writing");

  const handleGenerateRoadmap = async () => {
    setGeneratingRoadmap(true);
    setRoadmapError(null);
    try {
      await onGenerateRoadmap();
    } catch (e) {
      setRoadmapError("Failed to generate roadmap. Please try again.");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">

      {/* Hero score */}
      <motion.div variants={fadeUp} style={{
        padding: "32px", borderRadius: 16, background: "var(--surface)",
        border: "1px solid var(--border)", textAlign: "center", marginBottom: 16,
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>◎</div>
        <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, letterSpacing: "0.15em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 16 }}>
          Assessment Complete · {role}
        </div>
        <div style={{
          display: "inline-flex", flexDirection: "column", alignItems: "center",
          padding: "20px 40px", borderRadius: 12, background: "var(--bg)",
          border: "1px solid var(--border)", marginBottom: 20,
        }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 52, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
            {overall.pct}<span style={{ fontSize: 24, color: "var(--muted)" }}>%</span>
          </div>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {overall.raw} points
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: "inline-block", padding: "7px 24px", borderRadius: 20,
            background: lm.bg, border: `1px solid ${lm.border}`, color: lm.color,
            fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 700, letterSpacing: "0.12em",
          }}>{result.detectedLevel}</span>
          {result.statedLevel && result.detectedLevel && (
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
              You said: {result.statedLevel} → We detected: {result.detectedLevel}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "MCQ Score",       value: mcq.raw,                           sub: `${mcq.pct}%`     },
            { label: "Writing",         value: writing.raw,                        sub: `${writing.pct}%` },
            { label: "Tech Depth",      value: `${result.technicalDepthScore}/10`, sub: "depth"           },
            { label: "Problem Solving", value: `${result.problemSolvingScore}/10`, sub: "logic"           },
          ].map(item => (
            <div key={item.label} style={{
              padding: "12px 8px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)",
            }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{item.value}</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "var(--muted)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 20px", borderRadius: 20,
          background: `${rm.color}15`, border: `1px solid ${rm.color}44`,
        }}>
          <span style={{ color: rm.color, fontSize: 14 }}>{rm.icon}</span>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: rm.color, fontWeight: 600 }}>
            Interview Readiness: {result.interviewReadiness}
          </span>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>
            · Confidence: {result.confidenceLevel}
          </span>
        </div>
      </motion.div>

      {/* Final Verdict */}
      {result.finalVerdict && (
        <motion.div variants={fadeUp} style={{
          padding: "18px 20px", borderRadius: 12, background: "var(--surface)",
          border: "1px solid var(--border)", marginBottom: 16,
        }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
            Final Verdict
          </div>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>
            {result.finalVerdict}
          </div>
        </motion.div>
      )}

      {/* Strengths / Weak areas */}
      <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--surface)", border: "1px solid rgba(74,222,128,0.2)" }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "#4ade80", textTransform: "uppercase", marginBottom: 10 }}>✓ Strengths</div>
          {(result.strengths ?? []).map((s, i) => (
            <div key={i} style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--text)", lineHeight: 1.6, marginBottom: 4, display: "flex", gap: 8 }}>
              <span style={{ color: "#4ade80", flexShrink: 0 }}>→</span>{s}
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 18px", borderRadius: 12, background: "var(--surface)", border: "1px solid rgba(248,113,113,0.2)" }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "#f87171", textTransform: "uppercase", marginBottom: 10 }}>✗ Weak Areas</div>
          {(result.weakAreas ?? []).map((s, i) => (
            <div key={i} style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--text)", lineHeight: 1.6, marginBottom: 4, display: "flex", gap: 8 }}>
              <span style={{ color: "#f87171", flexShrink: 0 }}>→</span>{s}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Must learn next */}
      <motion.div variants={fadeUp} style={{ padding: "16px 18px", borderRadius: 12, background: "var(--surface)", border: "1px solid rgba(251,191,36,0.2)", marginBottom: 16 }}>
        <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "#fbbf24", textTransform: "uppercase", marginBottom: 10 }}>⚡ Must Learn Next</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(result.mustLearnNext ?? []).map((item, i) => (
            <span key={i} style={{
              padding: "4px 12px", borderRadius: 14,
              background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
              color: "#fbbf24", fontFamily: "IBM Plex Mono, monospace", fontSize: 12,
            }}>{item}</span>
          ))}
        </div>
      </motion.div>

      {/* Recommended topics */}
      <motion.div variants={fadeUp} style={{ padding: "16px 18px", borderRadius: 12, background: "var(--surface)", border: "1px solid rgba(129,140,248,0.2)", marginBottom: 20 }}>
        <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "#818cf8", textTransform: "uppercase", marginBottom: 10 }}>◈ Recommended Topics</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(result.recommendedTopics ?? []).map((item, i) => (
            <span key={i} style={{
              padding: "4px 12px", borderRadius: 14,
              background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.25)",
              color: "#818cf8", fontFamily: "IBM Plex Mono, monospace", fontSize: 12,
            }}>{item}</span>
          ))}
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>

        {/* Roadmap error */}
        {roadmapError && (
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)",
            color: "#f87171", fontSize: 12, fontFamily: "IBM Plex Mono, monospace",
          }}>
            {roadmapError}
          </div>
        )}

        {/* Generate Roadmap button */}
        {result.roadmapId ? (
          <button onClick={() => onViewRoadmap(result.roadmapId)} style={{
            width: "100%", padding: "14px",
            background: "var(--accent)", border: "none", borderRadius: 10,
            color: "#fff", fontFamily: "IBM Plex Mono, monospace", fontSize: 14,
            fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em",
          }}>
            View Your Personalized Roadmap →
          </button>
        ) : (
          <button
            onClick={handleGenerateRoadmap}
            disabled={generatingRoadmap}
            style={{
              width: "100%", padding: "14px",
              background: generatingRoadmap ? "var(--border)" : "var(--accent)",
              border: "none", borderRadius: 10,
              color: generatingRoadmap ? "var(--muted)" : "#fff",
              fontFamily: "IBM Plex Mono, monospace", fontSize: 14,
              fontWeight: 600, cursor: generatingRoadmap ? "default" : "pointer",
              letterSpacing: "0.05em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.2s",
            }}>
            {generatingRoadmap ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  style={{ width: 14, height: 14, border: "2px solid var(--muted)", borderTopColor: "#fff", borderRadius: "50%" }}
                />
                Generating your personalized roadmap...
              </>
            ) : "Generate Personalized Roadmap from Test Results →"}
          </button>
        )}

        {/* Review toggle */}
        <button onClick={() => setShowReview(v => !v)} style={{
          width: "100%", padding: "12px",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
          color: "var(--muted)", fontFamily: "IBM Plex Mono, monospace", fontSize: 13,
          cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.15s",
        }}>
          {showReview ? "▲ Hide Answer Review" : "▼ Review All Answers"}
        </button>
      </motion.div>

      {/* Answer review */}
      <AnimatePresence>
        {showReview && (
          <motion.div key="review"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            {mcqQ.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 18 }}>◈</span>
                  <div>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, fontSize: 15 }}>Multiple Choice — Review</div>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>
                      {mcqQ.filter(q => answers[String(q.id)] === q.correctAnswer).length}/{mcqQ.length} correct
                    </div>
                  </div>
                </div>
                <motion.div variants={stagger} initial="initial" animate="animate">
                  {mcqQ.map((q, i) => (
                    <McqReviewCard key={q.id} question={q} index={i + 1} userAnswer={answers[String(q.id)] ?? null} />
                  ))}
                </motion.div>
              </div>
            )}
            {writeQ.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 18 }}>✍</span>
                  <div>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, fontSize: 15 }}>Written Responses — Review</div>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>Your answers with model key points</div>
                  </div>
                </div>
                <motion.div variants={stagger} initial="initial" animate="animate">
                  {writeQ.map((q, i) => (
                    <WritingReviewCard key={q.id} question={q} index={mcqQ.length + i + 1} userAnswer={answers[String(q.id)] ?? ""} />
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function MockTestPage() {
  const navigate = useNavigate();

  const [phase, setPhase]       = useState("form");
  const [error, setError]       = useState(null);
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers]   = useState({});
  const [result, setResult]     = useState(null);

  const [role, setRole]               = useState("");
  const [experience, setExperience]   = useState("");
  const [currentLevel, setLevel]      = useState("Intermediate");
  const [goal, setGoal]               = useState("");
  const [assessType, setAssessType]   = useState("mixed");
  const [difficulty, setDifficulty]   = useState("medium");
  const [focusTopics, setFocusTopics] = useState("");

  const allQ     = testData?.questions ?? [];
  const mcqQ     = allQ.filter(q => q.type === "mcq");
  const writeQ   = allQ.filter(q => q.type === "writing");
  const answered = Object.keys(answers).length;
  const totalQ   = allQ.length;

  const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [String(qId)]: val }));

  // ── Start test ──────────────────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    if (!role.trim() || !experience) return;
    setPhase("loading"); setError(null);
    try {
      const data = await startMockTest({
        role: role.trim(),
        experienceLevel: experience,
        currentLevel,
        goal: goal.trim() || `Grow as a ${role}`,
        assessmentType: assessType,
        difficultyPreference: difficulty,
        focusTopics: focusTopics.trim(),
      });
      setTestData(data); setAnswers({}); setPhase("quiz");
    } catch (e) {
      setError("Failed to generate test. Please try again.");
      setPhase("form");
    }
  }, [role, experience, currentLevel, goal, assessType, difficulty, focusTopics]);

  // ── Submit test ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setPhase("submitting"); setError(null);
    try {
      const answerList = Object.entries(answers).map(([qId, ans]) => {
        const q = allQ.find(x => String(x.id) === String(qId));
        return { id: parseInt(qId), type: q?.type ?? "mcq", answer: ans };
      });
      const res = await submitMockTest({
        testId:          testData.testId,
        role,
        experienceLevel: experience,
        statedLevel:     currentLevel,
        goal:            goal.trim() || `Grow as a ${role}`,
        questions:       allQ,
        answers:         answerList,
      });
      setResult(res); setPhase("result");
    } catch (e) {
      setError("Submission failed. Please try again.");
      setPhase("quiz");
    }
  }, [answers, allQ, testData, role, experience, currentLevel, goal]);

  const handleTimerExpire = useCallback(() => {
    if (phase === "quiz") handleSubmit();
  }, [phase, handleSubmit]);

  // ── Generate roadmap from test results ──────────────────────────────────────
  // Uses the main axios (port 8080) NOT mockAxios (port 8081)
  const handleGenerateRoadmap = useCallback(async () => {
    if (!result) return;

    const levelMap    = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };
    const mappedLevel = levelMap[result.detectedLevel] ?? "Intermediate";

    const payload = {
      source:            "mocktest",          // tells roadmap agent this came from a test
      role,
      level:             mappedLevel,
      yearsOfExperience: experience,
      goal:              goal.trim() || `Grow as a ${role}`,
      timePerDay:        "1 hour",
      duration:          "3 months",
      // Full test context so the roadmap agent can personalise deeply
      testContext: {
        detectedLevel:      result.detectedLevel,
        statedLevel:        result.statedLevel ?? currentLevel,
        overallScore:       result.overallScore,
        mcqScore:           result.mcqScore,
        writingScore:       result.writingScore ?? result.codingScore,
        strengths:          result.strengths          ?? [],
        weakAreas:          result.weakAreas          ?? [],
        mustLearnNext:      result.mustLearnNext       ?? [],
        recommendedTopics:  result.recommendedTopics   ?? [],
        interviewReadiness: result.interviewReadiness,
        confidenceLevel:    result.confidenceLevel,
        finalVerdict:       result.finalVerdict,
      },
    };

    // ✅ Use generateRoadmap from roadmapApi — this hits port 8080 with auth token
    const data = await generateRoadmap(payload);

    if (data?.id) {
      navigate(`/roadmap/${data.id}`);
    } else {
      throw new Error("No roadmap ID returned");
    }
  }, [result, role, experience, currentLevel, goal, navigate]);

  const formValid = role.trim() && experience;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');
        .mockx-root {
          --surface: rgba(255,255,255,0.04);
          --muted: var(--text-dim);
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, var(--accent-dim), transparent 24%),
            linear-gradient(180deg, var(--bg) 0%, var(--bg-surface) 100%);
          color: var(--text);
          font-family: 'Manrope', sans-serif;
          padding-top: calc(var(--navbar-height, 56px) + 16px);
        }
        .mockx-shell {
          max-width: 880px;
          margin: 0 auto;
          padding: 40px 24px 120px;
        }
      `}</style>
    <div className="mockx-root">
      <div className="mockx-shell">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
                {phase === "form"         ? "Mock Assessment"
                 : phase === "loading"    ? "Generating Test"
                 : phase === "quiz"       ? `${role} · ${experience}`
                 : phase === "submitting" ? "Evaluating"
                 : "Assessment Report"}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                {phase === "form"         ? "Configure your assessment"
                 : phase === "loading"    ? `Building your ${totalQ || 25}-question test...`
                 : phase === "quiz"       ? "Answer every question."
                 : phase === "submitting" ? "Scoring & generating report..."
                 : "Your full assessment report"}
              </h1>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {phase === "quiz" && testData?.timeMinutes && (
                <CountdownTimer minutes={testData.timeMinutes} onExpire={handleTimerExpire} />
              )}
              {phase !== "result" && (
                <button onClick={() => navigate("/dashboard")} style={{
                  background: "none", border: "1px solid var(--border)", borderRadius: 6,
                  color: "var(--muted)", padding: "6px 14px", fontSize: 11,
                  cursor: "pointer", fontFamily: "IBM Plex Mono, monospace",
                }}>✕ Exit</button>
              )}
            </div>
          </div>
          {phase === "quiz" && (
            <div style={{ marginTop: 16 }}>
              <ProgressBar current={answered} total={totalQ} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, color: "var(--muted)", fontFamily: "IBM Plex Mono, monospace" }}>
                <span>{answered}/{totalQ} answered</span>
                <span>{testData?.totalPoints ?? 100} total points</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: 12, marginBottom: 20, fontFamily: "IBM Plex Mono, monospace" }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* FORM */}
          {phase === "form" && (
            <motion.div key="form" variants={stagger} initial="initial" animate="animate" exit="exit">
              <motion.p variants={fadeUp} style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, marginBottom: 32, maxWidth: 560 }}>
                Configure your assessment. Our AI engine will generate questions tailored to your role — then evaluate your answers and produce a full report with a personalized roadmap.
              </motion.p>

              <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontFamily: "IBM Plex Mono, monospace" }}>Target Role *</label>
                <input type="text" value={role} onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Java Backend Developer, Data Scientist, Product Manager..."
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--surface)", border: `1px solid ${role ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, padding: "12px 15px", color: "var(--text)", fontSize: 14, fontFamily: "IBM Plex Mono, monospace", outline: "none", transition: "border-color 0.2s" }}
                />
              </motion.div>

              <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontFamily: "IBM Plex Mono, monospace" }}>Your Goal (optional)</label>
                <input type="text" value={goal} onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. Land a senior role, Pass FAANG interviews, Switch to ML..."
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 15px", color: "var(--text)", fontSize: 14, fontFamily: "IBM Plex Mono, monospace", outline: "none" }}
                />
              </motion.div>

              <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontFamily: "IBM Plex Mono, monospace" }}>Focus Topics (optional)</label>
                <input type="text" value={focusTopics} onChange={e => setFocusTopics(e.target.value)}
                  placeholder="e.g. Spring Boot, REST APIs, Microservices, JPA..."
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 15px", color: "var(--text)", fontSize: 14, fontFamily: "IBM Plex Mono, monospace", outline: "none" }}
                />
              </motion.div>

              <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontFamily: "IBM Plex Mono, monospace" }}>Experience Level *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <motion.button key={opt.value} onClick={() => setExperience(opt.value)}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      style={{ padding: "12px 14px", borderRadius: 8, cursor: "pointer", background: experience === opt.value ? "var(--surface)" : "var(--bg)", border: `1px solid ${experience === opt.value ? "var(--accent)" : "var(--border)"}`, color: experience === opt.value ? "var(--accent)" : "var(--text)", fontFamily: "IBM Plex Mono, monospace", textAlign: "left", outline: "none", transition: "all 0.15s" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{opt.badge}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontFamily: "IBM Plex Mono, monospace" }}>Self-Assessed Level</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {LEVEL_OPTIONS.map(l => (
                    <motion.button key={l} onClick={() => setLevel(l)}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      style={{ flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer", background: currentLevel === l ? "var(--surface)" : "var(--bg)", border: `1px solid ${currentLevel === l ? "var(--accent)" : "var(--border)"}`, color: currentLevel === l ? "var(--accent)" : "var(--text)", fontFamily: "IBM Plex Mono, monospace", fontSize: 13, outline: "none", transition: "all 0.15s" }}>{l}</motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontFamily: "IBM Plex Mono, monospace" }}>Assessment Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {TYPE_OPTIONS.map(t => (
                    <motion.button key={t.value} onClick={() => setAssessType(t.value)}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      style={{ padding: "12px", borderRadius: 8, cursor: "pointer", background: assessType === t.value ? "var(--surface)" : "var(--bg)", border: `1px solid ${assessType === t.value ? "var(--accent)" : "var(--border)"}`, color: assessType === t.value ? "var(--accent)" : "var(--text)", fontFamily: "IBM Plex Mono, monospace", outline: "none", textAlign: "left", transition: "all 0.15s" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontFamily: "IBM Plex Mono, monospace" }}>Difficulty Preference</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {DIFFICULTY_OPTIONS.map(d => {
                    const dc = diffColor(d);
                    return (
                      <motion.button key={d} onClick={() => setDifficulty(d)}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        style={{ flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer", background: difficulty === d ? dc.bg : "var(--bg)", border: `1px solid ${difficulty === d ? dc.border : "var(--border)"}`, color: difficulty === d ? dc.text : "var(--text)", fontFamily: "IBM Plex Mono, monospace", fontSize: 13, textTransform: "capitalize", outline: "none", transition: "all 0.15s" }}>{d}</motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.button variants={fadeUp} onClick={handleStart} disabled={!formValid}
                whileHover={formValid ? { scale: 1.02 } : {}} whileTap={formValid ? { scale: 0.98 } : {}}
                style={{ padding: "14px 36px", background: formValid ? "var(--accent)" : "var(--border)", border: "none", borderRadius: 8, color: formValid ? "#fff" : "var(--muted)", fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 600, cursor: formValid ? "pointer" : "default", letterSpacing: "0.05em", transition: "all 0.2s" }}>
                Generate Test →
              </motion.button>
            </motion.div>
          )}

          {/* LOADING */}
          {phase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", paddingTop: 80 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 24px" }} />
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
                AI is crafting questions for<br />
                <strong style={{ color: "var(--text)" }}>{role}</strong> · <strong style={{ color: "var(--text)" }}>{experience}</strong> · <strong style={{ color: "var(--text)" }}>{difficulty}</strong>
              </div>
            </motion.div>
          )}

          {/* QUIZ */}
          {phase === "quiz" && testData && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {mcqQ.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 18 }}>◈</span>
                    <div>
                      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, fontSize: 15 }}>Multiple Choice</div>
                      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>Select the best answer</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--muted)" }}>
                      {mcqQ.filter(q => answers[String(q.id)]).length}/{mcqQ.length} done
                    </div>
                  </div>
                  <motion.div variants={stagger} initial="initial" animate="animate">
                    {mcqQ.map((q, i) => (
                      <McqCard key={q.id} question={q} index={i + 1}
                        selected={answers[String(q.id)] ?? null}
                        onSelect={val => setAnswer(q.id, val)} />
                    ))}
                  </motion.div>
                </div>
              )}
              {writeQ.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 18 }}>✍</span>
                    <div>
                      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, fontSize: 15 }}>Written Responses</div>
                      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--muted)" }}>Explain your thinking clearly</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--muted)" }}>
                      {writeQ.filter(q => (answers[String(q.id)] ?? "").trim().length > 10).length}/{writeQ.length} done
                    </div>
                  </div>
                  <motion.div variants={stagger} initial="initial" animate="animate">
                    {writeQ.map((q, i) => (
                      <WritingCard key={q.id} question={q} index={mcqQ.length + i + 1}
                        value={answers[String(q.id)] ?? ""}
                        onChange={val => setAnswer(q.id, val)} />
                    ))}
                  </motion.div>
                </div>
              )}
              <div style={{ position: "sticky", bottom: 24, background: "var(--bg)", padding: "14px 0 4px", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <ProgressBar current={answered} total={totalQ} />
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, fontFamily: "IBM Plex Mono, monospace" }}>
                      {answered}/{totalQ} answered {answered < totalQ ? `· ${totalQ - answered} remaining` : "· ✓ all done!"}
                    </div>
                  </div>
                  <motion.button onClick={handleSubmit} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: "12px 28px", borderRadius: 8, background: answered === totalQ ? "var(--accent)" : "var(--surface)", border: `1px solid ${answered === totalQ ? "var(--accent)" : "var(--border)"}`, color: answered === totalQ ? "#fff" : "var(--muted)", fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}>
                    {answered < totalQ ? `Submit (${totalQ - answered} skipped)` : "Submit Test →"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBMITTING */}
          {phase === "submitting" && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", paddingTop: 80 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "#a78bfa", borderRadius: "50%", margin: "0 auto 24px" }} />
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
                AI is evaluating your answers...<br />generating your Phase 4 report
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {phase === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ReportCard
                result={result}
                role={role}
                allQ={allQ}
                answers={answers}
                onViewRoadmap={id => navigate(`/roadmap/${id}`)}
                onGenerateRoadmap={handleGenerateRoadmap}
              />
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  onClick={() => { setPhase("form"); setResult(null); setTestData(null); setAnswers({}); }}
                  style={{ background: "none", border: "none", color: "var(--muted)", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                  Take another test
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
    </>
  );
}
