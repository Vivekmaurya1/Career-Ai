// src/pages/MockTestPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import mockAxios from "./../api/mocktestaxios";
import { generateRoadmap } from "./../api/roadmapApi";

const startMockTest  = (p) => mockAxios.post("/api/mocktest/start",  p).then(r => r.data);
const submitMockTest = (p) => mockAxios.post("/api/mocktest/submit", p).then(r => r.data);

/* ── Constants ─────────────────────────────────────────────────────────────── */
const EXPERIENCE_OPTIONS = [
  { value: "0-6 months",  label: "< 6 months",  badge: "Fresher"   },
  { value: "6-12 months", label: "6–12 months", badge: "Junior"    },
  { value: "1-2 years",   label: "1–2 years",   badge: "Junior"    },
  { value: "2-4 years",   label: "2–4 years",   badge: "Mid-level" },
  { value: "4-7 years",   label: "4–7 years",   badge: "Senior"    },
  { value: "7+ years",    label: "7+ years",     badge: "Principal" },
];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const TYPE_OPTIONS  = [
  { value: "mixed",   label: "Mixed",    desc: "20 MCQ + 5 Written" },
  { value: "quiz",    label: "MCQ Only", desc: "25 Multiple Choice" },
  { value: "writing", label: "Written",  desc: "25 Descriptive"     },
];
const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

/* ── Motion presets ────────────────────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1];
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.36, ease } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.18 } },
};
const stagger = { animate: { transition: { staggerChildren: 0.045 } } };

/* ── Helpers ───────────────────────────────────────────────────────────────── */
const diffMeta = (d) => ({
  easy:   { bg: "var(--success-bg)",  brd: "var(--success-brd)",  fg: "var(--success)",  label: "Easy"   },
  medium: { bg: "var(--warn-bg)",     brd: "var(--warn-brd)",     fg: "var(--warn)",     label: "Medium" },
  hard:   { bg: "var(--error-bg)",    brd: "var(--error-brd)",    fg: "var(--error)",    label: "Hard"   },
}[d?.toLowerCase()] ?? { bg: "var(--srf)", brd: "var(--brd)", fg: "var(--t3)", label: d ?? "—" });

/* ── Shared sub-components ────────────────────────────────────────────────── */

function Mono({ children, size = 11, color = "var(--t3)", style = {} }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: size, color, letterSpacing: "0.1em", ...style }}>
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 2, height: 16, background: "var(--a)", borderRadius: 1, flexShrink: 0 }} />
      <Mono size={9} color="var(--a)" style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>
        {children}
      </Mono>
    </div>
  );
}

function FieldGroup({ label, children, style = {} }) {
  return (
    <div style={{ marginBottom: 22, ...style }}>
      <Mono size={9} color="var(--t3)" style={{ display: "block", marginBottom: 8, letterSpacing: "0.18em", textTransform: "uppercase" }}>
        {label}
      </Mono>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, highlight }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        height: 46, padding: "0 14px",
        background: "var(--bg-2)",
        border: `1px solid ${highlight && value ? "var(--a-brd)" : "var(--brd)"}`,
        borderRadius: "var(--r-md)",
        color: "var(--t1)",
        fontFamily: "var(--font-sans)", fontSize: 13,
        outline: "none",
        transition: "border-color 150ms, box-shadow 150ms",
      }}
      onFocus={e => { e.target.style.borderColor = "var(--a-brd)"; e.target.style.boxShadow = "0 0 0 3px var(--a-dim)"; }}
      onBlur={e  => { e.target.style.borderColor = (highlight && value) ? "var(--a-brd)" : "var(--brd)"; e.target.style.boxShadow = "none"; }}
    />
  );
}

function SegmentButton({ active, onClick, children, accentColor, style = {} }) {
  return (
    <button onClick={onClick}
      style={{
        padding: "10px 16px", borderRadius: "var(--r-sm)", cursor: "pointer",
        background: active ? (accentColor ? `${accentColor}18` : "var(--a-dim)") : "var(--bg-1)",
        border: `1px solid ${active ? (accentColor ?? "var(--a-brd)") : "var(--brd)"}`,
        color: active ? (accentColor ?? "var(--a)") : "var(--t2)",
        fontFamily: "var(--font-mono)", fontSize: 11, transition: "all 150ms",
        outline: "none", ...style,
      }}>
      {children}
    </button>
  );
}

function ProgressBar({ pct, color = "var(--a)" }) {
  return (
    <div style={{ height: 3, background: "var(--brd)", borderRadius: 2, overflow: "hidden" }}>
      <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ height: "100%", background: color, borderRadius: 2 }} />
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
  const ratio = secs / (minutes * 60);
  const col = ratio > 0.5 ? "var(--success)" : ratio > 0.2 ? "var(--warn)" : "var(--error)";
  const m = Math.floor(secs / 60), s = secs % 60;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "6px 12px",
      background: `color-mix(in srgb, ${col} 10%, transparent)`,
      border: `1px solid color-mix(in srgb, ${col} 35%, transparent)`,
      borderRadius: "var(--r-pill)",
    }}>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke={col} strokeWidth="1.4"/>
        <path d="M6 3.5V6l2 1.5" stroke={col} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      <Mono size={12} color={col} style={{ fontWeight: 600 }}>
        {String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
      </Mono>
    </div>
  );
}

/* ── MCQ Card ──────────────────────────────────────────────────────────────── */
function McqCard({ question, index, selected, onSelect }) {
  const dm = diffMeta(question.difficulty);
  return (
    <motion.div
      id={`q-${question.id}`}
      variants={fadeUp}
      style={{
        marginBottom: 12,
        background: "var(--bg-1)",
        border: `1px solid ${selected ? "var(--a-brd)" : "var(--brd)"}`,
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        transition: "border-color 200ms",
      }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px",
        borderBottom: "1px solid var(--brd-lo)",
        background: selected ? "var(--a-dim)" : "rgba(255,255,255,0.012)",
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: selected ? "var(--a-dim)" : "var(--srf)",
          border: `1px solid ${selected ? "var(--a-brd)" : "var(--brd)"}`,
          display: "grid", placeItems: "center",
        }}>
          <Mono size={10} color={selected ? "var(--a)" : "var(--t4)"} style={{ fontWeight: 600 }}>
            {String(index).padStart(2, "0")}
          </Mono>
        </div>
        <span style={{
          padding: "2px 8px", borderRadius: "var(--r-pill)",
          background: dm.bg, border: `1px solid ${dm.brd}`,
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em",
          textTransform: "uppercase", color: dm.fg,
        }}>{dm.label}</span>
        {question.topic && (
          <Mono size={10} color="var(--t3)" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {question.topic}
          </Mono>
        )}
        <Mono size={10} color="var(--t4)" style={{ marginLeft: "auto", flexShrink: 0 }}>
          {question.points} pts
        </Mono>
      </div>
      <div style={{ padding: "14px 16px 0" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.65, color: "var(--t1)", margin: 0 }}>
          {question.question}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 16px 14px" }}>
        {question.options?.map((opt, i) => {
          const isSel = selected === opt;
          const letters = ["A","B","C","D","E"];
          return (
            <motion.button key={opt} onClick={() => onSelect(opt)}
              whileTap={{ scale: 0.995 }}
              style={{
                padding: "10px 14px", borderRadius: "var(--r-sm)", cursor: "pointer", textAlign: "left",
                background: isSel ? "var(--a-dim)" : "var(--bg-2)",
                border: `1px solid ${isSel ? "var(--a-brd)" : "var(--brd)"}`,
                display: "flex", alignItems: "center", gap: 10, outline: "none",
                transition: "all 150ms",
              }}
              onMouseEnter={e => { if (!isSel) { e.currentTarget.style.borderColor = "var(--brd-hi)"; e.currentTarget.style.background = "var(--srf)"; }}}
              onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = "var(--brd)"; e.currentTarget.style.background = "var(--bg-2)"; }}}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                background: isSel ? "var(--a)" : "var(--srf)",
                border: `1px solid ${isSel ? "var(--a)" : "var(--brd)"}`,
                display: "grid", placeItems: "center",
                transition: "all 150ms",
              }}>
                {isSel
                  ? <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2L7.5 2" stroke="var(--a-text)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <Mono size={8} color="var(--t4)" style={{ fontWeight: 600 }}>{letters[i]}</Mono>
                }
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: isSel ? "var(--a)" : "var(--t2)", flex: 1, transition: "color 150ms" }}>
                {opt}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Writing Card ──────────────────────────────────────────────────────────── */
function WritingCard({ question, index, value, onChange }) {
  const wc = value.trim() ? value.trim().split(/\s+/).length : 0;
  const dm = diffMeta(question.difficulty);
  const kps = question.expectedKeyPoints ?? [];
  const filled = value?.trim().length > 0;
  return (
    <motion.div
      id={`q-${question.id}`}
      variants={fadeUp}
      style={{
        marginBottom: 12,
        background: "var(--bg-1)",
        border: `1px solid ${filled ? "var(--a-brd)" : "var(--brd)"}`,
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        transition: "border-color 200ms",
      }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px",
        borderBottom: "1px solid var(--brd-lo)",
        background: filled ? "var(--a-dim)" : "rgba(255,255,255,0.012)",
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: "var(--srf)", border: "1px solid var(--brd)",
          display: "grid", placeItems: "center",
        }}>
          <Mono size={10} color="var(--a)" style={{ fontWeight: 600 }}>{String(index).padStart(2,"0")}</Mono>
        </div>
        <span style={{
          padding: "2px 8px", borderRadius: "var(--r-pill)",
          background: dm.bg, border: `1px solid ${dm.brd}`,
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em",
          textTransform: "uppercase", color: dm.fg,
        }}>{dm.label}</span>
        <span style={{
          padding: "2px 8px", borderRadius: "var(--r-pill)",
          background: "var(--info-bg)", border: "1px solid var(--info-brd)",
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--info)",
        }}>Written</span>
        {question.topic && <Mono size={10} color="var(--t3)" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{question.topic}</Mono>}
        <Mono size={10} color="var(--t4)" style={{ marginLeft: "auto", flexShrink: 0 }}>{question.points} pts</Mono>
      </div>
      <div style={{ padding: "14px 16px 12px" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.65, color: "var(--t1)", margin: "0 0 12px" }}>
          {question.question}
        </p>
        {kps.length > 0 && (
          <div style={{
            padding: "10px 12px", borderRadius: "var(--r-sm)",
            background: "var(--bg-2)", border: "1px solid var(--brd)",
            marginBottom: 12,
          }}>
            <Mono size={8} color="var(--t4)" style={{ display: "block", marginBottom: 7, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Key points to cover
            </Mono>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {kps.map((kp, i) => (
                <span key={i} style={{
                  padding: "2px 8px", borderRadius: "var(--r-pill)",
                  background: "var(--a-dim)", border: "1px solid var(--a-brd)",
                  fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--a)",
                }}>{kp}</span>
              ))}
            </div>
          </div>
        )}
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Write your answer here… (aim for 80–150 words)"
          rows={5}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "var(--bg-2)",
            border: `1px solid ${filled ? "var(--a-brd)" : "var(--brd)"}`,
            borderRadius: "var(--r-sm)",
            padding: "11px 13px",
            color: "var(--t1)",
            fontFamily: "var(--font-sans)", fontSize: 13,
            outline: "none", resize: "vertical", lineHeight: 1.65,
            transition: "border-color 150ms",
          }}
          onFocus={e => { e.target.style.borderColor = "var(--a-brd)"; e.target.style.boxShadow = "0 0 0 3px var(--a-dim)"; }}
          onBlur={e  => { e.target.style.borderColor = filled ? "var(--a-brd)" : "var(--brd)"; e.target.style.boxShadow = "none"; }}
        />
        <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 2, background: "var(--brd)", borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((wc / 80) * 100, 100)}%`, background: wc >= 80 ? "var(--success)" : wc >= 30 ? "var(--a)" : "var(--t4)", borderRadius: 1, transition: "width 0.3s, background 0.3s" }}/>
          </div>
          <Mono size={10} color={wc >= 80 ? "var(--success)" : wc >= 30 ? "var(--a)" : "var(--t4)"}>
            {wc} / 80 words
          </Mono>
        </div>
      </div>
    </motion.div>
  );
}

/* ── MCQ Review Card ───────────────────────────────────────────────────────── */
function McqReviewCard({ question, index, userAnswer }) {
  const dm = diffMeta(question.difficulty);
  const correct = question.correctAnswer;
  const isCorrect = userAnswer === correct;
  const isSkipped = !userAnswer;
  const statusColor = isSkipped ? "var(--t3)" : isCorrect ? "var(--success)" : "var(--error)";
  const letters = ["A","B","C","D","E"];
  return (
    <motion.div variants={fadeUp} style={{
      marginBottom: 10,
      background: "var(--bg-1)",
      border: `1px solid ${isSkipped ? "var(--brd)" : isCorrect ? "var(--success-brd)" : "var(--error-brd)"}`,
      borderRadius: "var(--r-lg)", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: isSkipped ? "transparent" : isCorrect ? "var(--success-bg)" : "var(--error-bg)",
        borderBottom: "1px solid var(--brd-lo)",
      }}>
        <Mono size={10} color={statusColor} style={{ fontWeight: 700 }}>
          {isSkipped ? "—" : isCorrect ? "✓" : "✗"}
        </Mono>
        <Mono size={9} color="var(--t4)" style={{ fontWeight: 600 }}>Q{String(index).padStart(2,"0")}</Mono>
        <span style={{ padding: "2px 8px", borderRadius: "var(--r-pill)", background: dm.bg, border: `1px solid ${dm.brd}`, fontFamily: "var(--font-mono)", fontSize: 9, color: dm.fg }}>{dm.label}</span>
        {question.topic && <Mono size={10} color="var(--t3)" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{question.topic}</Mono>}
        <Mono size={10} color={statusColor} style={{ marginLeft: "auto", fontWeight: 600 }}>
          {isSkipped ? "Skipped · 0 pts" : isCorrect ? `+${question.points} pts` : "0 pts"}
        </Mono>
      </div>
      <div style={{ padding: "12px 16px 14px" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.65, color: "var(--t1)", margin: "0 0 10px" }}>{question.question}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {question.options?.map((opt, i) => {
            const isC = opt === correct;
            const isU = opt === userAnswer;
            const bg    = isC ? "var(--success-bg)"  : (isU && !isCorrect) ? "var(--error-bg)"  : "var(--bg-2)";
            const brd   = isC ? "var(--success-brd)" : (isU && !isCorrect) ? "var(--error-brd)" : "var(--brd)";
            const color = isC ? "var(--success)"     : (isU && !isCorrect) ? "var(--error)"     : "var(--t3)";
            return (
              <div key={opt} style={{ padding: "8px 12px", borderRadius: "var(--r-sm)", background: bg, border: `1px solid ${brd}`, display: "flex", alignItems: "center", gap: 10 }}>
                <Mono size={9} color={color} style={{ fontWeight: 700, width: 14 }}>{letters[i]}</Mono>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color, flex: 1 }}>{opt}</span>
                {isC && <Mono size={8} color="var(--success)" style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>Correct</Mono>}
                {isU && !isCorrect && <Mono size={8} color="var(--error)" style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>Your pick</Mono>}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Writing Review Card ───────────────────────────────────────────────────── */
function WritingReviewCard({ question, index, userAnswer }) {
  const dm = diffMeta(question.difficulty);
  const kps = question.expectedKeyPoints ?? [];
  const has = userAnswer?.trim().length > 0;
  return (
    <motion.div variants={fadeUp} style={{
      marginBottom: 10, background: "var(--bg-1)",
      border: `1px solid ${has ? "var(--a-brd)" : "var(--brd)"}`,
      borderRadius: "var(--r-lg)", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: has ? "var(--a-dim)" : "transparent", borderBottom: "1px solid var(--brd-lo)" }}>
        <Mono size={9} color="var(--t4)" style={{ fontWeight: 600 }}>Q{String(index).padStart(2,"0")}</Mono>
        <span style={{ padding: "2px 8px", borderRadius: "var(--r-pill)", background: dm.bg, border: `1px solid ${dm.brd}`, fontFamily: "var(--font-mono)", fontSize: 9, color: dm.fg }}>{dm.label}</span>
        <span style={{ padding: "2px 8px", borderRadius: "var(--r-pill)", background: "var(--info-bg)", border: "1px solid var(--info-brd)", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--info)" }}>Written</span>
        <Mono size={10} color={has ? "var(--a)" : "var(--t4)"} style={{ marginLeft: "auto" }}>{has ? "Answered" : "Skipped"}</Mono>
      </div>
      <div style={{ padding: "12px 16px 14px" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.65, color: "var(--t1)", margin: "0 0 10px" }}>{question.question}</p>
        <div style={{ padding: "10px 12px", borderRadius: "var(--r-sm)", background: "var(--bg-2)", border: `1px solid ${has ? "var(--a-brd)" : "var(--brd)"}`, marginBottom: kps.length ? 10 : 0 }}>
          <Mono size={8} color="var(--a)" style={{ display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.14em" }}>Your Answer</Mono>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: has ? "var(--t1)" : "var(--t4)", lineHeight: 1.65, margin: 0, fontStyle: has ? "normal" : "italic" }}>
            {has ? userAnswer : "No answer provided"}
          </p>
        </div>
        {kps.length > 0 && (
          <div style={{ padding: "10px 12px", borderRadius: "var(--r-sm)", background: "var(--success-bg)", border: "1px solid var(--success-brd)" }}>
            <Mono size={8} color="var(--success)" style={{ display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.14em" }}>Model Key Points</Mono>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {kps.map((kp, i) => (
                <span key={i} style={{ padding: "2px 8px", borderRadius: "var(--r-pill)", background: "var(--success-bg)", border: "1px solid var(--success-brd)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--success)" }}>{kp}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Left Rail ─────────────────────────────────────────────────────────────── */
function PhaseRail({ phase, role, experience, difficulty, answered, totalQ, testData, allQ, mcqQ, answers }) {
  const phases = [
    { id: "form",      label: "Setup",      num: "01" },
    { id: "loading",   label: "Generating", num: "02" },
    { id: "quiz",      label: "Assessment", num: "03" },
    { id: "submitting",label: "Scoring",    num: "04" },
    { id: "result",    label: "Report",     num: "05" },
  ];
  const phaseOrder = phases.map(p => p.id);
  const currentIdx = phaseOrder.indexOf(phase);
  const pct = totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;

  /* Topic breakdown from questions */
  const topicMap = (allQ ?? []).reduce((acc, q) => {
    const t = q.topic || "General";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const topics = Object.entries(topicMap).sort((a, b) => b[1] - a[1]);
  const maxTopicCount = topics[0]?.[1] ?? 1;

  /* Correct count for MCQ */
  const correctCount = (mcqQ ?? []).filter(q => (answers ?? {})[String(q.id)] === q.correctAnswer).length;

  const scrollToQ = (qId) => {
    document.getElementById(`q-${qId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: "var(--bg-1)",
      borderRight: "1px solid var(--brd)",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh",
      overflowY: "auto",
    }}>
      {/* Logo / title */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--brd)", flexShrink: 0 }}>
        <Mono size={8} color="var(--t4)" style={{ display: "block", marginBottom: 4, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          CareerAI
        </Mono>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.02em" }}>
          Mock Assessment
        </div>
      </div>

      {/* Phase steps */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--brd)", flexShrink: 0 }}>
        {phases.map((p, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={p.id} style={{ position: "relative" }}>
              {i < phases.length - 1 && (
                <div style={{
                  position: "absolute", left: 29, top: 34, width: 1, height: 14,
                  background: done ? "var(--a)" : "var(--brd)",
                  transition: "background 0.4s",
                }} />
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 18px",
                background: active ? "var(--a-dim)" : "transparent",
                borderLeft: `2px solid ${active ? "var(--a)" : "transparent"}`,
                transition: "all 150ms",
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: done ? "var(--a)" : active ? "var(--a-dim)" : "var(--srf)",
                  border: `1.5px solid ${done ? "var(--a)" : active ? "var(--a-brd)" : "var(--brd)"}`,
                  display: "grid", placeItems: "center",
                  boxShadow: active ? "0 0 8px var(--a-glow)" : "none",
                  transition: "all 0.3s",
                  opacity: i > currentIdx ? 0.4 : 1,
                }}>
                  {done
                    ? <svg width="8" height="8" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2L7.5 2" stroke="var(--a-text)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <Mono size={8} color={active ? "var(--a)" : "var(--t4)"} style={{ fontWeight: 700 }}>{p.num}</Mono>
                  }
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "var(--a)" : done ? "var(--t1)" : "var(--t4)", transition: "color 150ms" }}>
                    {p.label}
                  </div>
                  {active && p.id === "quiz" && totalQ > 0 && (
                    <Mono size={9} color="var(--t3)">{answered}/{totalQ} answered</Mono>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── QUIZ-ONLY SECTIONS ── */}
      {phase === "quiz" && allQ.length > 0 && (
        <>
          {/* Question Navigator */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--brd)", flexShrink: 0 }}>
            <SectionLabel>Question Navigator</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
              {allQ.map((q, i) => {
                const id = String(q.id);
                const isAnswered = !!answers[id];
                const isWrite = q.type === "writing";
                const writeIdx = i - mcqQ.length + 1;
                return (
                  <div
                    key={q.id}
                    onClick={() => scrollToQ(q.id)}
                    title={q.topic || (isWrite ? "Written" : "MCQ")}
                    style={{
                      aspectRatio: "1", borderRadius: 4, cursor: "pointer",
                      background: isAnswered
                        ? (isWrite ? "var(--info-bg)" : "var(--a-dim)")
                        : "var(--srf)",
                      border: `1px ${isWrite ? "dashed" : "solid"} ${
                        isAnswered
                          ? (isWrite ? "var(--info-brd)" : "var(--a-brd)")
                          : "var(--brd)"
                      }`,
                      display: "grid", placeItems: "center",
                      fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 600,
                      color: isAnswered
                        ? (isWrite ? "var(--info)" : "var(--a)")
                        : "var(--t4)",
                      transition: "all 100ms",
                      userSelect: "none",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = isWrite ? "var(--info-brd)" : "var(--a-brd)"; }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isAnswered
                        ? (isWrite ? "var(--info-brd)" : "var(--a-brd)")
                        : "var(--brd)";
                    }}
                  >
                    {isWrite ? `W${writeIdx}` : String(i + 1).padStart(2, "0")}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              {[
                { bg: "var(--a-dim)", brd: "var(--a-brd)", dashed: false, label: "MCQ done" },
                { bg: "var(--info-bg)", brd: "var(--info-brd)", dashed: true, label: "Written" },
                { bg: "var(--srf)", brd: "var(--brd)", dashed: false, label: "Pending" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                    background: l.bg,
                    border: `1px ${l.dashed ? "dashed" : "solid"} ${l.brd}`,
                  }} />
                  <Mono size={8} color="var(--t3)">{l.label}</Mono>
                </div>
              ))}
            </div>
          </div>

          {/* Session Stats */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--brd)", flexShrink: 0 }}>
            <SectionLabel>Session Stats</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { val: answered,           label: "Answered",  color: "var(--a)"       },
                { val: totalQ - answered,  label: "Remaining", color: "var(--t3)"      },
                { val: correctCount,       label: "Correct",   color: "var(--success)" },
                { val: totalQ,             label: "Total Qs",  color: "var(--t2)"      },
              ].map(s => (
                <div key={s.label} style={{
                  background: "var(--srf)", border: "1px solid var(--brd)",
                  borderRadius: "var(--r-md)", padding: "10px 12px",
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                    {s.val}
                  </div>
                  <Mono size={8} color="var(--t4)" style={{ display: "block", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    {s.label}
                  </Mono>
                </div>
              ))}
            </div>
          </div>

          {/* Topics Breakdown */}
          {topics.length > 0 && (
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--brd)", flexShrink: 0 }}>
              <SectionLabel>Topics</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {topics.map(([topic, count]) => (
                  <div key={topic} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--t2)",
                      flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{topic}</span>
                    <div style={{ width: 50, height: 3, background: "var(--brd)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                      <div style={{
                        height: "100%",
                        width: `${(count / maxTopicCount) * 100}%`,
                        background: "var(--a)", borderRadius: 2,
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                    <Mono size={8} color="var(--t4)" style={{ width: 14, textAlign: "right", flexShrink: 0 }}>{count}</Mono>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Metadata + progress (always shown when data exists) */}
      {(role || experience || difficulty) && (
        <div style={{ padding: "16px 18px", marginTop: phase === "quiz" ? 0 : "auto" }}>
          {[
            { k: "Role",       v: role || "—" },
            { k: "Experience", v: experience || "—" },
            { k: "Difficulty", v: difficulty || "—" },
          ].map(({ k, v }) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <Mono size={8} color="var(--t4)" style={{ display: "block", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.14em" }}>{k}</Mono>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</div>
            </div>
          ))}
          {phase === "quiz" && totalQ > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <Mono size={8} color="var(--t4)" style={{ textTransform: "uppercase", letterSpacing: "0.14em" }}>Progress</Mono>
                <Mono size={9} color="var(--a)">{pct}%</Mono>
              </div>
              <ProgressBar pct={pct} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Result / Report ───────────────────────────────────────────────────────── */
function ReportCard({ result, role, allQ, answers, onViewRoadmap, onGenerateRoadmap }) {
  const [showReview,  setShowReview]  = useState(false);
  const [genLoading,  setGenLoading]  = useState(false);
  const [genError,    setGenError]    = useState(null);

  const levelColor = { BEGINNER: "var(--success)", INTERMEDIATE: "var(--warn)", ADVANCED: "var(--a)" };
  const readyMeta  = {
    "Not Ready":       { color: "var(--error)",   icon: "✗" },
    "Partially Ready": { color: "var(--warn)",    icon: "◐" },
    "Ready":           { color: "var(--success)", icon: "✓" },
  };

  const parseScore = (s) => {
    if (!s) return { pct: 0, raw: "—" };
    const [a, b] = String(s).split("/");
    if (b) return { pct: Math.round((parseFloat(a) / parseFloat(b)) * 100) || 0, raw: s };
    return { pct: parseInt(s) || 0, raw: s };
  };

  const overall = parseScore(result.overallScore);
  const mcq     = parseScore(result.mcqScore);
  const writing = parseScore(result.writingScore ?? result.codingScore);
  const mcqQ    = allQ.filter(q => q.type === "mcq");
  const writeQ  = allQ.filter(q => q.type === "writing");
  const rm      = readyMeta[result.interviewReadiness] ?? readyMeta["Partially Ready"];
  const lc      = levelColor[result.detectedLevel] ?? "var(--a)";

  const handleGenerate = async () => {
    setGenLoading(true); setGenError(null);
    try { await onGenerateRoadmap(); }
    catch { setGenError("Failed to generate roadmap. Please try again."); }
    finally { setGenLoading(false); }
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" style={{ maxWidth: 760 }}>
      <motion.div variants={fadeUp} style={{
        background: "var(--bg-1)", border: "1px solid var(--brd)", borderRadius: "var(--r-xl)",
        overflow: "hidden", marginBottom: 12,
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, var(--a) 0%, ${lc} 60%, transparent 100%)` }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: "1px solid var(--brd)" }}>
          {[
            { label: "Overall Score", value: `${overall.pct}%`, sub: overall.raw, accent: lc },
            { label: "MCQ Score",     value: `${mcq.pct}%`,     sub: mcq.raw,     accent: "var(--a)" },
            { label: "Written Score", value: `${writing.pct}%`, sub: writing.raw, accent: "var(--info)" },
            { label: "Depth",         value: `${result.technicalDepthScore ?? "—"}/10`, sub: "technical", accent: "var(--warn)" },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: "20px 18px",
              borderRight: i < 3 ? "1px solid var(--brd)" : "none",
              background: i === 0 ? `${lc}08` : "transparent",
            }}>
              <Mono size={8} color="var(--t4)" style={{ display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.14em" }}>{s.label}</Mono>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 800, color: s.accent, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {s.value}
              </div>
              <Mono size={9} color="var(--t4)" style={{ marginTop: 4 }}>{s.sub}</Mono>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", flexWrap: "wrap" }}>
          <span style={{
            padding: "5px 14px", borderRadius: "var(--r-pill)",
            background: `${lc}14`, border: `1px solid ${lc}40`,
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", color: lc,
          }}>{result.detectedLevel}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: "var(--r-pill)", background: `color-mix(in srgb, ${rm.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${rm.color} 30%, transparent)` }}>
            <Mono size={11} color={rm.color} style={{ fontWeight: 700 }}>{rm.icon}</Mono>
            <Mono size={11} color={rm.color} style={{ fontWeight: 600 }}>Interview: {result.interviewReadiness}</Mono>
          </div>
          {result.statedLevel && (
            <Mono size={10} color="var(--t4)" style={{ marginLeft: "auto" }}>
              Self-assessed: {result.statedLevel} → Detected: <span style={{ color: lc }}>{result.detectedLevel}</span>
            </Mono>
          )}
        </div>
      </motion.div>

      {result.finalVerdict && (
        <motion.div variants={fadeUp} style={{ padding: "16px 20px", borderRadius: "var(--r-lg)", background: "var(--bg-1)", border: "1px solid var(--brd)", marginBottom: 12 }}>
          <SectionLabel>Final Verdict</SectionLabel>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--t2)", lineHeight: 1.7, margin: 0 }}>{result.finalVerdict}</p>
        </motion.div>
      )}

      <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--bg-1)", border: "1px solid var(--success-brd)" }}>
          <SectionLabel>Strengths</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(result.strengths ?? []).map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <span style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: 10, marginTop: 2, flexShrink: 0 }}>→</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--t2)", lineHeight: 1.55 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--bg-1)", border: "1px solid var(--error-brd)" }}>
          <SectionLabel>Weak Areas</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(result.weakAreas ?? []).map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <span style={{ color: "var(--error)", fontFamily: "var(--font-mono)", fontSize: 10, marginTop: 2, flexShrink: 0 }}>→</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--t2)", lineHeight: 1.55 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--bg-1)", border: "1px solid var(--warn-brd)" }}>
          <SectionLabel>Must Learn Next</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(result.mustLearnNext ?? []).map((it, i) => (
              <span key={i} style={{ padding: "3px 10px", borderRadius: "var(--r-pill)", background: "var(--warn-bg)", border: "1px solid var(--warn-brd)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--warn)" }}>{it}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--bg-1)", border: "1px solid var(--a-brd)" }}>
          <SectionLabel>Recommended Topics</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(result.recommendedTopics ?? []).map((it, i) => (
              <span key={i} style={{ padding: "3px 10px", borderRadius: "var(--r-pill)", background: "var(--a-dim)", border: "1px solid var(--a-brd)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--a)" }}>{it}</span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {genError && (
          <div style={{ padding: "10px 14px", borderRadius: "var(--r-sm)", background: "var(--error-bg)", border: "1px solid var(--error-brd)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--error)" }}>
            {genError}
          </div>
        )}
        {result.roadmapId ? (
          <button onClick={() => onViewRoadmap(result.roadmapId)} style={{
            height: 48, background: "var(--a)", border: "none", borderRadius: "var(--r-md)",
            color: "var(--a-text)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "filter 150ms",
          }}
          onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
          onMouseLeave={e => e.currentTarget.style.filter = "none"}>
            View Personalized Roadmap →
          </button>
        ) : (
          <button onClick={handleGenerate} disabled={genLoading} style={{
            height: 48, background: genLoading ? "var(--srf)" : "var(--a)", border: `1px solid ${genLoading ? "var(--brd)" : "var(--a)"}`,
            borderRadius: "var(--r-md)", color: genLoading ? "var(--t3)" : "var(--a-text)",
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 800,
            cursor: genLoading ? "default" : "pointer", letterSpacing: "0.01em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 200ms",
          }}>
            {genLoading
              ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} style={{ width: 14, height: 14, border: "2px solid var(--brd)", borderTopColor: "var(--a)", borderRadius: "50%" }}/> Generating roadmap…</>
              : "Generate Personalized Roadmap from Results →"
            }
          </button>
        )}
        <button onClick={() => setShowReview(v => !v)} style={{
          height: 40, background: "var(--bg-1)", border: "1px solid var(--brd)", borderRadius: "var(--r-md)",
          color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer", letterSpacing: "0.06em",
          transition: "all 150ms",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--brd-hi)"; e.currentTarget.style.color = "var(--t1)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--brd)"; e.currentTarget.style.color = "var(--t3)"; }}>
          {showReview ? "▲ Hide Answer Review" : "▼ Review All Answers"}
        </button>
      </motion.div>

      <AnimatePresence>
        {showReview && (
          <motion.div key="review" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            {mcqQ.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--brd)" }}>
                  <SectionLabel>Multiple Choice — Review</SectionLabel>
                  <Mono size={10} color="var(--t4)" style={{ marginLeft: "auto" }}>
                    {mcqQ.filter(q => answers[String(q.id)] === q.correctAnswer).length}/{mcqQ.length} correct
                  </Mono>
                </div>
                <motion.div variants={stagger} initial="initial" animate="animate">
                  {mcqQ.map((q, i) => <McqReviewCard key={q.id} question={q} index={i+1} userAnswer={answers[String(q.id)] ?? null}/>)}
                </motion.div>
              </div>
            )}
            {writeQ.length > 0 && (
              <div>
                <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--brd)" }}>
                  <SectionLabel>Written Responses — Review</SectionLabel>
                </div>
                <motion.div variants={stagger} initial="initial" animate="animate">
                  {writeQ.map((q, i) => <WritingReviewCard key={q.id} question={q} index={mcqQ.length+i+1} userAnswer={answers[String(q.id)] ?? ""}/>)}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function MockTestPage() {
  const navigate = useNavigate();

  const [phase,      setPhase]    = useState("form");
  const [error,      setError]    = useState(null);
  const [testData,   setTestData] = useState(null);
  const [answers,    setAnswers]  = useState({});
  const [result,     setResult]   = useState(null);

  const [role,        setRole]       = useState("");
  const [experience,  setExperience] = useState("");
  const [level,       setLevel]      = useState("Intermediate");
  const [goal,        setGoal]       = useState("");
  const [assessType,  setAssessType] = useState("mixed");
  const [difficulty,  setDifficulty] = useState("medium");
  const [focusTopics, setFocusTopics]= useState("");

  const allQ     = testData?.questions ?? [];
  const mcqQ     = allQ.filter(q => q.type === "mcq");
  const writeQ   = allQ.filter(q => q.type === "writing");
  const answered = Object.keys(answers).length;
  const totalQ   = allQ.length;
  const formValid = role.trim() && experience;

  const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [String(qId)]: val }));

  const handleStart = useCallback(async () => {
    if (!formValid) return;
    setPhase("loading"); setError(null);
    try {
      const data = await startMockTest({ role: role.trim(), experienceLevel: experience, currentLevel: level, goal: goal.trim() || `Grow as a ${role}`, assessmentType: assessType, difficultyPreference: difficulty, focusTopics: focusTopics.trim() });
      setTestData(data); setAnswers({}); setPhase("quiz");
    } catch { setError("Failed to generate test. Please try again."); setPhase("form"); }
  }, [role, experience, level, goal, assessType, difficulty, focusTopics, formValid]);

  const handleSubmit = useCallback(async () => {
    setPhase("submitting"); setError(null);
    try {
      const answerList = Object.entries(answers).map(([qId, ans]) => {
        const q = allQ.find(x => String(x.id) === String(qId));
        return { id: parseInt(qId), type: q?.type ?? "mcq", answer: ans };
      });
      const res = await submitMockTest({ testId: testData.testId, role, experienceLevel: experience, statedLevel: level, goal: goal.trim() || `Grow as a ${role}`, questions: allQ, answers: answerList });
      setResult(res); setPhase("result");
    } catch { setError("Submission failed. Please try again."); setPhase("quiz"); }
  }, [answers, allQ, testData, role, experience, level, goal]);

  const handleTimerExpire = useCallback(() => { if (phase === "quiz") handleSubmit(); }, [phase, handleSubmit]);

  const handleGenerateRoadmap = useCallback(async () => {
    if (!result) return;
    const levelMap = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };
    const payload = { source: "mocktest", role, level: levelMap[result.detectedLevel] ?? "Intermediate", yearsOfExperience: experience, goal: goal.trim() || `Grow as a ${role}`, timePerDay: "1 hour", duration: "3 months", testContext: { detectedLevel: result.detectedLevel, statedLevel: result.statedLevel ?? level, overallScore: result.overallScore, mcqScore: result.mcqScore, writingScore: result.writingScore ?? result.codingScore, strengths: result.strengths ?? [], weakAreas: result.weakAreas ?? [], mustLearnNext: result.mustLearnNext ?? [], recommendedTopics: result.recommendedTopics ?? [], interviewReadiness: result.interviewReadiness, confidenceLevel: result.confidenceLevel, finalVerdict: result.finalVerdict } };
    const data = await generateRoadmap(payload);
    if (data?.id) navigate(`/roadmap/${data.id}`);
    else throw new Error("No roadmap ID returned");
  }, [result, role, experience, level, goal, navigate]);

  const diffMd = diffMeta(difficulty);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>

      {/* ── Left rail ── */}
      <PhaseRail
        phase={phase} role={role} experience={experience} difficulty={difficulty}
        answered={answered} totalQ={totalQ} testData={testData}
        allQ={allQ} mcqQ={mcqQ} answers={answers}
      />

      {/* ── Main content ── */}
      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>

        {/* ── Top bar — test-contextual ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "color-mix(in srgb, var(--bg) 92%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--brd)",
          padding: "0 clamp(20px, 4vw, 48px)",
          height: 56, display: "flex", alignItems: "center", gap: 10,
        }}>

          {/* Context pills — only during/after test */}
          {phase !== "form" && phase !== "loading" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
              {/* Live indicator */}
              {(phase === "quiz") && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "3px 9px", borderRadius: "var(--r-pill)",
                  background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
                }}>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }}
                  />
                  <Mono size={9} color="var(--success)" style={{ fontWeight: 700 }}>LIVE</Mono>
                </div>
              )}
              {/* Role pill */}
              {role && (
                <div style={{
                  padding: "3px 10px", borderRadius: "var(--r-pill)",
                  background: "var(--srf)", border: "1px solid var(--brd)",
                }}>
                  <Mono size={10} color="var(--t2)">{role}</Mono>
                </div>
              )}
              {/* Experience pill */}
              {experience && (
                <div style={{
                  padding: "3px 10px", borderRadius: "var(--r-pill)",
                  background: "var(--srf)", border: "1px solid var(--brd)",
                }}>
                  <Mono size={10} color="var(--t2)">{experience}</Mono>
                </div>
              )}
              {/* Difficulty pill */}
              {difficulty && (
                <div style={{
                  padding: "3px 10px", borderRadius: "var(--r-pill)",
                  background: diffMd.bg, border: `1px solid ${diffMd.brd}`,
                }}>
                  <Mono size={10} color={diffMd.fg} style={{ textTransform: "capitalize" }}>{difficulty}</Mono>
                </div>
              )}
              {/* Phase label */}
              {phase === "result" && (
                <div style={{
                  padding: "3px 10px", borderRadius: "var(--r-pill)",
                  background: "var(--a-dim)", border: "1px solid var(--a-brd)",
                }}>
                  <Mono size={9} color="var(--a)">Assessment Complete</Mono>
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Mono size={9} color="var(--t4)" style={{ textTransform: "uppercase", letterSpacing: "0.2em" }}>
                {phase === "form" ? "Setup" : "Generating"}
              </Mono>
            </div>
          )}

          {/* Timer */}
          {phase === "quiz" && testData?.timeMinutes && (
            <CountdownTimer minutes={testData.timeMinutes} onExpire={handleTimerExpire} />
          )}

          {/* Quiz progress pill */}
          {phase === "quiz" && totalQ > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", background: "var(--bg-1)", border: "1px solid var(--brd)", borderRadius: "var(--r-pill)" }}>
              <Mono size={10} color="var(--a)">{answered}/{totalQ}</Mono>
              <div style={{ width: 60 }}><ProgressBar pct={(answered/totalQ)*100} /></div>
            </div>
          )}

          {phase !== "result" && (
            <button onClick={() => navigate("/dashboard")} style={{
              height: 30, padding: "0 12px",
              background: "var(--bg-1)", border: "1px solid var(--brd)",
              borderRadius: "var(--r-sm)", color: "var(--t3)",
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
              cursor: "pointer", transition: "all 150ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--error-brd)"; e.currentTarget.style.color = "var(--error)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--brd)"; e.currentTarget.style.color = "var(--t3)"; }}>
              ✕ EXIT
            </button>
          )}
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              style={{ padding: "10px clamp(20px,4vw,48px)", background: "var(--error-bg)", borderBottom: "1px solid var(--error-brd)" }}>
              <Mono size={11} color="var(--error)">⚠ {error}</Mono>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page body */}
        <div style={{ padding: "clamp(24px,4vw,48px)", maxWidth: 900 }}>
          <AnimatePresence mode="wait">

            {/* ── FORM ── */}
            {phase === "form" && (
              <motion.div key="form" variants={stagger} initial="initial" animate="animate" exit={{ opacity: 0, y: -8, transition: { duration: 0.16 } }}>
                <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
                  <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--t1)", lineHeight: 1.1, marginBottom: 8 }}>
                    Configure Assessment
                  </h1>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--t3)", lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
                    Our AI generates questions tailored to your role, evaluates every answer, and produces a full diagnostic report with a personalized roadmap.
                  </p>
                </motion.div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" }}>
                  <div>
                    <motion.div variants={fadeUp}>
                      <FieldGroup label="Target Role *">
                        <TextInput value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Java Backend Developer, Data Scientist…" highlight />
                      </FieldGroup>
                    </motion.div>
                    <motion.div variants={fadeUp}>
                      <FieldGroup label="Your Goal (optional)">
                        <TextInput value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Land a senior role, Pass FAANG interviews…" />
                      </FieldGroup>
                    </motion.div>
                    <motion.div variants={fadeUp}>
                      <FieldGroup label="Focus Topics (optional)">
                        <TextInput value={focusTopics} onChange={e => setFocusTopics(e.target.value)} placeholder="e.g. Spring Boot, REST APIs, Microservices…" />
                      </FieldGroup>
                    </motion.div>
                    <motion.div variants={fadeUp}>
                      <FieldGroup label="Self-Assessed Level">
                        <div style={{ display: "flex", gap: 6 }}>
                          {LEVEL_OPTIONS.map(l => (
                            <SegmentButton key={l} active={level === l} onClick={() => setLevel(l)} style={{ flex: 1, fontSize: 11 }}>
                              {l}
                            </SegmentButton>
                          ))}
                        </div>
                      </FieldGroup>
                    </motion.div>
                  </div>

                  <div>
                    <motion.div variants={fadeUp}>
                      <FieldGroup label="Experience Level *">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          {EXPERIENCE_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => setExperience(opt.value)}
                              style={{
                                padding: "10px 12px", borderRadius: "var(--r-sm)", cursor: "pointer", textAlign: "left",
                                background: experience === opt.value ? "var(--a-dim)" : "var(--bg-2)",
                                border: `1px solid ${experience === opt.value ? "var(--a-brd)" : "var(--brd)"}`,
                                outline: "none", transition: "all 150ms",
                              }}>
                              <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: experience === opt.value ? "var(--a)" : "var(--t2)", marginBottom: 2 }}>{opt.label}</div>
                              <Mono size={9} color={experience === opt.value ? "var(--a)" : "var(--t4)"}>{opt.badge}</Mono>
                            </button>
                          ))}
                        </div>
                      </FieldGroup>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                      <FieldGroup label="Assessment Type">
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {TYPE_OPTIONS.map(t => (
                            <button key={t.value} onClick={() => setAssessType(t.value)}
                              style={{
                                padding: "11px 14px", borderRadius: "var(--r-sm)", cursor: "pointer", textAlign: "left",
                                background: assessType === t.value ? "var(--a-dim)" : "var(--bg-2)",
                                border: `1px solid ${assessType === t.value ? "var(--a-brd)" : "var(--brd)"}`,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                outline: "none", transition: "all 150ms",
                              }}>
                              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: assessType === t.value ? "var(--a)" : "var(--t2)" }}>{t.label}</span>
                              <Mono size={9} color={assessType === t.value ? "var(--a)" : "var(--t4)"}>{t.desc}</Mono>
                            </button>
                          ))}
                        </div>
                      </FieldGroup>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                      <FieldGroup label="Difficulty Preference">
                        <div style={{ display: "flex", gap: 6 }}>
                          {DIFFICULTY_OPTIONS.map(d => {
                            const dm = diffMeta(d);
                            return (
                              <SegmentButton key={d} active={difficulty === d} onClick={() => setDifficulty(d)}
                                accentColor={difficulty === d ? dm.fg : undefined}
                                style={{ flex: 1, fontSize: 11, textTransform: "capitalize",
                                  background: difficulty === d ? dm.bg : "var(--bg-2)",
                                  border: `1px solid ${difficulty === d ? dm.brd : "var(--brd)"}`,
                                  color: difficulty === d ? dm.fg : "var(--t3)",
                                }}>
                                {d}
                              </SegmentButton>
                            );
                          })}
                        </div>
                      </FieldGroup>
                    </motion.div>
                  </div>
                </div>

                <motion.div variants={fadeUp} style={{ marginTop: 12, paddingTop: 22, borderTop: "1px solid var(--brd)", display: "flex", alignItems: "center", gap: 14 }}>
                  <button onClick={handleStart} disabled={!formValid}
                    style={{
                      height: 46, padding: "0 28px",
                      background: formValid ? "var(--a)" : "var(--srf)",
                      border: `1px solid ${formValid ? "var(--a)" : "var(--brd)"}`,
                      borderRadius: "var(--r-md)",
                      color: formValid ? "var(--a-text)" : "var(--t4)",
                      fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 800,
                      cursor: formValid ? "pointer" : "not-allowed",
                      transition: "all 200ms",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                    Generate Test →
                  </button>
                  {!formValid && (
                    <Mono size={10} color="var(--t4)">
                      {!role.trim() && !experience ? "Enter role & experience" : !role.trim() ? "Enter target role" : "Select experience level"}
                    </Mono>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* ── LOADING ── */}
            {phase === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ textAlign: "center" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                    style={{ width: 44, height: 44, border: "2px solid var(--brd)", borderTopColor: "var(--a)", borderRadius: "50%", margin: "0 auto 24px" }} />
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 6 }}>
                    Building your test
                  </div>
                  <Mono size={11} color="var(--t3)">
                    {role} · {experience} · {difficulty}
                  </Mono>
                </div>
              </motion.div>
            )}

            {/* ── QUIZ ── */}
            {phase === "quiz" && testData && (
              <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {mcqQ.length > 0 && (
                  <div style={{ marginBottom: 36 }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--brd)" }}>
                      <div>
                        <SectionLabel>Multiple Choice</SectionLabel>
                        <Mono size={10} color="var(--t4)">Select the best answer for each question</Mono>
                      </div>
                      <Mono size={11} color="var(--a)" style={{ marginLeft: "auto" }}>
                        {mcqQ.filter(q => answers[String(q.id)]).length}/{mcqQ.length} done
                      </Mono>
                    </div>
                    <motion.div variants={stagger} initial="initial" animate="animate">
                      {mcqQ.map((q, i) => (
                        <McqCard key={q.id} question={q} index={i+1}
                          selected={answers[String(q.id)] ?? null}
                          onSelect={val => setAnswer(q.id, val)} />
                      ))}
                    </motion.div>
                  </div>
                )}

                {writeQ.length > 0 && (
                  <div style={{ marginBottom: 36 }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--brd)" }}>
                      <div>
                        <SectionLabel>Written Responses</SectionLabel>
                        <Mono size={10} color="var(--t4)">Explain your thinking clearly — aim for 80+ words</Mono>
                      </div>
                      <Mono size={11} color="var(--a)" style={{ marginLeft: "auto" }}>
                        {writeQ.filter(q => (answers[String(q.id)] ?? "").trim().length > 10).length}/{writeQ.length} done
                      </Mono>
                    </div>
                    <motion.div variants={stagger} initial="initial" animate="animate">
                      {writeQ.map((q, i) => (
                        <WritingCard key={q.id} question={q} index={mcqQ.length+i+1}
                          value={answers[String(q.id)] ?? ""}
                          onChange={val => setAnswer(q.id, val)} />
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* Sticky submit bar */}
                <div style={{
                  position: "sticky", bottom: 0, zIndex: 10,
                  background: "color-mix(in srgb, var(--bg) 94%, transparent)",
                  backdropFilter: "blur(12px)",
                  borderTop: "1px solid var(--brd)",
                  padding: "12px 0",
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <ProgressBar pct={(answered/totalQ)*100} />
                    <Mono size={10} color="var(--t4)" style={{ marginTop: 5 }}>
                      {answered}/{totalQ} answered{answered < totalQ ? ` · ${totalQ - answered} remaining` : " · ✓ All answered"}
                    </Mono>
                  </div>
                  <button onClick={handleSubmit}
                    style={{
                      height: 40, padding: "0 24px",
                      background: answered === totalQ ? "var(--a)" : "var(--bg-1)",
                      border: `1px solid ${answered === totalQ ? "var(--a)" : "var(--brd)"}`,
                      borderRadius: "var(--r-md)",
                      color: answered === totalQ ? "var(--a-text)" : "var(--t2)",
                      fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 800,
                      cursor: "pointer", transition: "all 200ms", flexShrink: 0,
                    }}>
                    {answered < totalQ ? `Submit (${totalQ - answered} skipped)` : "Submit Test →"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── SUBMITTING ── */}
            {phase === "submitting" && (
              <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ textAlign: "center" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                    style={{ width: 44, height: 44, border: "2px solid var(--brd)", borderTopColor: "var(--a)", borderRadius: "50%", margin: "0 auto 24px" }} />
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 6 }}>
                    Scoring your answers
                  </div>
                  <Mono size={11} color="var(--t3)">Generating your full diagnostic report…</Mono>
                </div>
              </motion.div>
            )}

            {/* ── RESULT ── */}
            {phase === "result" && result && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--t1)", lineHeight: 1.1, marginBottom: 6 }}>
                    Assessment Complete
                  </h1>
                  <Mono size={11} color="var(--t3)">{role} · {experience}</Mono>
                </div>
                <ReportCard result={result} role={role} allQ={allQ} answers={answers}
                  onViewRoadmap={id => navigate(`/roadmap/${id}`)}
                  onGenerateRoadmap={handleGenerateRoadmap} />
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--brd)" }}>
                  <button
                    onClick={() => { setPhase("form"); setResult(null); setTestData(null); setAnswers({}); }}
                    style={{ background: "none", border: "none", color: "var(--t4)", fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em", textDecoration: "underline", textUnderlineOffset: 3 }}>
                    ← Take another test
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}