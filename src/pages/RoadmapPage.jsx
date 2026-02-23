// src/pages/RoadmapPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { getRoadmapById, saveProgress, getProgress } from "../api/roadmapApi";
import { motion, AnimatePresence } from "framer-motion";

/* ─── NORMALIZERS ──────────────────────────────────────────────────────────── */
const safeStr = (obj, ...keys) => { for (const k of keys) { const v=obj?.[k]; if(typeof v==="string"&&v.trim()) return v.trim(); if(typeof v==="number") return String(v); } return ""; };
const safeArr = (obj, ...keys) => { for (const k of keys) { const v=obj?.[k]; if(Array.isArray(v)&&v.length) return v; } return []; };
const normalizeTopic   = (t) => typeof t==="string"?{topic_name:t,subtopics:[],concepts_to_master:[],recommended_practice:[],mini_project:null}:{topic_name:safeStr(t,"topic_name","topicName","name","title","topic"),subtopics:safeArr(t,"subtopics","sub_topics"),concepts_to_master:safeArr(t,"concepts_to_master","conceptsToMaster","concepts"),recommended_practice:safeArr(t,"recommended_practice","recommendedPractice","practice"),mini_project:t.mini_project??t.miniProject??t.project??null};
const normalizePhase   = (p) => ({phase_title:safeStr(p,"phase_title","phaseTitle","title","name"),duration:safeStr(p,"duration","time","timeframe"),outcome:safeStr(p,"outcome","goal","objective"),topics:safeArr(p,"topics","topic_list").map(normalizeTopic)});
const normalizeWeek    = (w,i) => typeof w==="string"?{week:i+1,focus:w,topics_to_cover:[],practice_goals:[],project_milestone:""}:{week:w.week_number??w.week??i+1,focus:safeStr(w,"focus","theme","title","topic","description"),topics_to_cover:safeArr(w,"topics_to_cover","topicsToCover","topics"),practice_goals:safeArr(w,"practice_goals","practiceGoals","goals","exercises"),project_milestone:safeStr(w,"project_milestone","milestone","project")};
const normalizeStage   = (s) => typeof s==="string"?{stage:s,focus_areas:[],common_questions:[],mock_strategy:""}:{stage:safeStr(s,"stage","name","title","round"),focus_areas:safeArr(s,"focus_areas","focusAreas","areas","topics","skills"),common_questions:safeArr(s,"common_questions","commonQuestions","questions"),mock_strategy:safeStr(s,"mock_strategy","mockStrategy","strategy","tip")};
const normalizeProject = (p) => typeof p==="string"?{title:p,description:"",features:[],core_topics_used:[],expected_outcome:""}:{title:safeStr(p,"title","name","project_name"),description:safeStr(p,"description","desc","summary"),features:safeArr(p,"features","feature_list"),core_topics_used:safeArr(p,"core_topics_used","coreTopicsUsed","topics_used","tech_stack"),expected_outcome:safeStr(p,"expected_outcome","expectedOutcome","outcome")};
const normalizeProjects= (raw) => { if(!raw) return {}; if(Array.isArray(raw)) return {beginner:raw.map(normalizeProject)}; const result={}; for(const level of["beginner","intermediate","advanced"]){const items=raw[level];if(Array.isArray(items)&&items.length)result[level]=items.map(normalizeProject);} if(!Object.keys(result).length){for(const[k,v] of Object.entries(raw)){if(Array.isArray(v))result[k]=v.map(normalizeProject);}} return result; };
const normalizeRoadmap = (raw) => { if(!raw) return null; const ir=safeArr(raw,"interview_preparation","interviewPreparation","interview_prep","interview"); return {title:safeStr(raw,"title"),role:safeStr(raw,"role"),phases:safeArr(raw,"phases","learning_phases").map(normalizePhase),projects:normalizeProjects(raw.projects??raw.project_list??{}),weekly_plan:safeArr(raw,"weekly_plan","weeklyPlan","weekly_schedule","weeks","schedule").map((w,i)=>normalizeWeek(w,i)),interview_preparation:ir.map(normalizeStage)}; };

/* ─── PROGRESS HELPERS ─────────────────────────────────────────────────────── */
const LS_KEY = (id) => `roadmap_progress_${id}`;

const loadLocalProgress = (id) => {
  try { const r = localStorage.getItem(LS_KEY(id)); return r ? JSON.parse(r) : null; } catch { return null; }
};
const saveLocalProgress = (id, data) => {
  try { localStorage.setItem(LS_KEY(id), JSON.stringify(data)); } catch {}
};

/* ─── COMPLETION CALCULATOR ────────────────────────────────────────────────── */
const calcPercent = (progress, phases, weekly, projects, interview) => {
  const allProjects = ["beginner","intermediate","advanced"].flatMap(l => (projects[l]||[]).map((_,i) => `${l}-${i}`));

  const topicKeys = phases.flatMap((p,pi) => p.topics.map((_,ti) => `phase-${pi}-topic-${ti}`));
  const weekKeys  = weekly.map((_,i) => `week-${i}`);
  const projKeys  = allProjects;
  const ivKeys    = interview.map((_,i) => `interview-${i}`);

  const pct = (keys) => {
    if (!keys.length) return 100; // empty section = complete
    const done = keys.filter(k => progress[k]).length;
    return Math.round((done / keys.length) * 100);
  };

  const sections = [pct(topicKeys), pct(weekKeys), pct(projKeys), pct(ivKeys)];
  return Math.round(sections.reduce((a,b) => a+b, 0) / sections.length);
};

/* ─── CHECKBOX ─────────────────────────────────────────────────────────────── */
function Checkbox({ checked, onChange, label, size = 16 }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(!checked); }}
      title={checked ? "Mark incomplete" : "Mark done"}
      style={{
        width: size, height: size, flexShrink: 0,
        border: `1.5px solid ${checked ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
        borderRadius: 2, background: checked ? "rgba(34,197,94,0.15)" : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", padding: 0,
      }}
    >
      {checked && (
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

/* ─── PROGRESS RING ────────────────────────────────────────────────────────── */
function ProgressRing({ pct }) {
  const r = 28, circ = 2 * Math.PI * r;
  const color = pct >= 100 ? "#22c55e" : pct >= 60 ? "#f59e0b" : pct >= 30 ? "#60a5fa" : "rgba(255,255,255,0.2)";
  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ - (circ * pct) / 100}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color, lineHeight: 1 }}>{pct}</span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>%</span>
      </div>
    </div>
  );
}

/* ─── TOPIC ROW ────────────────────────────────────────────────────────────── */
function TopicRow({ topic, index, phaseIdx, progress, setProgress }) {
  const [open, setOpen] = useState(false);
  const key = `phase-${phaseIdx}-topic-${index}`;
  const done = !!progress[key];
  const hasContent = topic.subtopics?.length || topic.concepts_to_master?.length || topic.recommended_practice?.length || topic.mini_project;

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: done ? "rgba(34,197,94,0.02)" : "transparent", transition: "background 0.2s" }}>
      <div
        onClick={() => hasContent && setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", cursor: hasContent ? "pointer" : "default", transition: "background 0.15s" }}
        onMouseEnter={e => hasContent && (e.currentTarget.style.background = "rgba(245,158,11,0.03)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <Checkbox checked={done} onChange={v => setProgress(p => ({ ...p, [key]: v }))} />
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(245,158,11,0.3)", minWidth: 28, flexShrink: 0 }}>{String(index + 1).padStart(2, "0")}</span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: done ? "rgba(34,197,94,0.7)" : "rgba(232,232,232,0.8)", flex: 1, textDecoration: done ? "line-through" : "none", transition: "all 0.2s" }}>
          {topic.topic_name || `Topic ${index + 1}`}
        </span>
        {topic.concepts_to_master?.length > 0 && (
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.1em", color: "rgba(232,232,232,0.25)", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 2 }}>{topic.concepts_to_master.length} CONCEPTS</span>
        )}
        {hasContent && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "rgba(245,158,11,0.4)", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        )}
      </div>

      <AnimatePresence>
        {open && hasContent && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ overflow: "hidden", background: "rgba(245,158,11,0.02)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ padding: "16px 24px 20px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
              {topic.concepts_to_master?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "#f59e0b", marginBottom: 10 }}>CONCEPTS</div>
                  {topic.concepts_to_master.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "rgba(232,232,232,0.5)", lineHeight: 1.8 }}>
                      <span style={{ color: "rgba(245,158,11,0.4)", flexShrink: 0 }}>▸</span>{String(c)}
                    </div>
                  ))}
                </div>
              )}
              {topic.subtopics?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "#60a5fa", marginBottom: 10 }}>SUBTOPICS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {topic.subtopics.map((s, i) => <span key={i} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, padding: "3px 8px", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 2, color: "rgba(96,165,250,0.7)" }}>{String(s)}</span>)}
                  </div>
                </div>
              )}
              {topic.recommended_practice?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "#34d399", marginBottom: 10 }}>PRACTICE</div>
                  {topic.recommended_practice.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: "rgba(232,232,232,0.5)", lineHeight: 1.8 }}>
                      <span style={{ color: "rgba(52,211,153,0.4)", flexShrink: 0 }}>▸</span>{String(p)}
                    </div>
                  ))}
                </div>
              )}
              {topic.mini_project && (
                <div style={{ gridColumn: "1/-1", padding: "12px 14px", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 2, background: "rgba(251,191,36,0.04)" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "#fbbf24", marginBottom: 6 }}>⚡ MINI PROJECT</div>
                  <div style={{ fontSize: 12, color: "#fde68a" }}>{typeof topic.mini_project === "string" ? topic.mini_project : topic.mini_project.title}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── PHASE BLOCK ──────────────────────────────────────────────────────────── */
function PhaseBlock({ phase, index, defaultOpen, progress, setProgress }) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = ["#f59e0b","#60a5fa","#34d399","#c084fc","#f87171","#22d3ee"];
  const color = colors[index % colors.length];

  const topicKeys    = phase.topics.map((_, ti) => `phase-${index}-topic-${ti}`);
  const allDone      = topicKeys.length > 0 && topicKeys.every(k => progress[k]);
  const someDone     = topicKeys.some(k => progress[k]);
  const doneCount    = topicKeys.filter(k => progress[k]).length;
  const phasePct     = topicKeys.length ? Math.round((doneCount / topicKeys.length) * 100) : 0;

  const togglePhase = (e) => {
    e.stopPropagation();
    const newVal = !allDone;
    setProgress(prev => {
      const next = { ...prev };
      topicKeys.forEach(k => { next[k] = newVal; });
      return next;
    });
  };

  return (
    <div style={{ border: `1px solid ${allDone ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: 4, overflow: "hidden", marginBottom: 8, transition: "border-color 0.3s" }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", cursor: "pointer", background: allDone ? "rgba(34,197,94,0.03)" : "#0a0a0a", transition: "background 0.2s", position: "relative" }}
        onMouseEnter={e => e.currentTarget.style.background = allDone ? "rgba(34,197,94,0.05)" : "#0d0d0d"}
        onMouseLeave={e => e.currentTarget.style.background = allDone ? "rgba(34,197,94,0.03)" : "#0a0a0a"}
      >
        <div style={{ width: 3, height: 40, background: allDone ? "#22c55e" : color, borderRadius: 1, flexShrink: 0, transition: "background 0.3s" }} />

        <div style={{ width: 40, height: 40, border: `1px solid ${allDone ? "rgba(34,197,94,0.4)" : `${color}40`}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "border-color 0.3s" }}>
          {allDone
            ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9L7.5 13.5L15 5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color }}>{String(index + 1).padStart(2, "0")}</span>
          }
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.16em", color: allDone ? "rgba(34,197,94,0.6)" : `${color}99`, marginBottom: 4 }}>
            PHASE {index + 1} · {doneCount}/{topicKeys.length} TOPICS
          </div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: "0.04em", color: allDone ? "#22c55e" : "#f0f0f0", transition: "color 0.3s" }}>
            {(phase.phase_title || `PHASE ${index + 1}`).toUpperCase()}
          </div>

          {/* Mini progress bar */}
          {topicKeys.length > 0 && (
            <div style={{ marginTop: 8, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, width: 160, overflow: "hidden" }}>
              <div style={{ height: "100%", background: allDone ? "#22c55e" : color, borderRadius: 1, width: `${phasePct}%`, transition: "width 0.4s ease, background 0.3s" }} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {phase.duration && (
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(232,232,232,0.3)", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 }}>{phase.duration}</span>
          )}
          {/* Mark all / unmark all */}
          <button
            onClick={togglePhase}
            title={allDone ? "Unmark all topics" : "Mark all topics done"}
            style={{
              padding: "5px 10px", background: allDone ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${allDone ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 2, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 9, letterSpacing: "0.1em", color: allDone ? "#22c55e" : "rgba(232,232,232,0.4)",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >
            {allDone ? "✓ DONE" : someDone ? "MARK ALL" : "MARK ALL"}
          </button>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "rgba(255,255,255,0.3)", transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>
            <path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }} style={{ overflow: "hidden" }}>
            {phase.outcome && (
              <div style={{ padding: "14px 24px", background: "rgba(52,211,153,0.04)", borderTop: "1px solid rgba(52,211,153,0.1)", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 10, color: "#34d399", flexShrink: 0, marginTop: 1 }}>✓</span>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(52,211,153,0.5)", marginBottom: 4 }}>PHASE OUTCOME</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "rgba(52,211,153,0.8)", lineHeight: 1.6 }}>{phase.outcome}</div>
                </div>
              </div>
            )}
            {phase.topics?.map((t, ti) => (
              <TopicRow key={ti} topic={t} index={ti} phaseIdx={index} progress={progress} setProgress={setProgress} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── TABS ─────────────────────────────────────────────────────────────────── */
const TABS = ["PHASES","WEEKLY","PROJECTS","INTERVIEW"];

/* ─── MAIN PAGE ────────────────────────────────────────────────────────────── */
export default function RoadmapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [raw, setRaw]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState("PHASES");
  const [progress, setProgress] = useState({});
  const [saving, setSaving]   = useState(false);
  const saveTimer             = useRef(null);

  // ── Fetch roadmap ──────────────────────────────────────────────────────────
  const fetchRoadmap = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const d = await getRoadmapById(id);
      setRaw(d);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load");
    } finally { setLoading(false); }
  }, [id]);

  // ── Fetch progress ─────────────────────────────────────────────────────────
  const fetchProgress = useCallback(async () => {
    try {
      const data = await getProgress(id);            // hits /api/roadmap/progress/{id}
      if (data && typeof data === "object" && Object.keys(data).length) {
        setProgress(data);
        return;
      }
    } catch {}
    // Fallback to localStorage
    const local = loadLocalProgress(id);
    if (local) setProgress(local);
  }, [id]);

  useEffect(() => { fetchRoadmap(); fetchProgress(); }, [fetchRoadmap, fetchProgress]);

  // ── Auto-save progress (debounced 800ms) ───────────────────────────────────
  useEffect(() => {
    if (!Object.keys(progress).length) return;
    saveLocalProgress(id, progress);  // always mirror to localStorage immediately
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try { await saveProgress(id, progress); }
      catch {}                                       // silent — localStorage is already updated
      finally { setSaving(false); }
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [progress, id]);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", gap:16, fontFamily:"'IBM Plex Mono',monospace" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:24, height:24, border:"1px solid rgba(245,158,11,0.3)", borderTopColor:"#f59e0b", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
      <span style={{ fontSize:11, letterSpacing:"0.14em", color:"rgba(232,232,232,0.3)" }}>LOADING ROADMAP...</span>
    </div>
  );

  const roadmap  = normalizeRoadmap(raw?.roadmap ?? raw);
  const level    = raw?.level ?? "";
  const role     = raw?.role ?? raw?.roadmap?.role ?? "Career";
  const timePerDay = raw?.timePerDay ?? "";
  const duration = raw?.duration ?? "";
  const phases   = roadmap?.phases ?? [];
  const weekly   = roadmap?.weekly_plan ?? [];
  const projects = roadmap?.projects ?? {};
  const interview= roadmap?.interview_preparation ?? [];
  const allProjects = ["beginner","intermediate","advanced"].flatMap(l => (projects[l]||[]).map((_,i)=>({lvl:l,i})));

  const pct = calcPercent(progress, phases, weekly, projects, interview);
  const counts = { PHASES:phases.length, WEEKLY:weekly.length, PROJECTS:allProjects.length, INTERVIEW:interview.length };

  // Section-level done counts for tab badges
  const topicTotal  = phases.flatMap((p,pi) => p.topics.map((_,ti) => `phase-${pi}-topic-${ti}`));
  const weekTotal   = weekly.map((_,i) => `week-${i}`);
  const projTotal   = allProjects.map(p => `project-${p.lvl}-${p.i}`);
  const ivTotal     = interview.map((_,i) => `interview-${i}`);
  const sectionDone = {
    PHASES:    topicTotal.filter(k=>progress[k]).length,
    WEEKLY:    weekTotal.filter(k=>progress[k]).length,
    PROJECTS:  projTotal.filter(k=>progress[k]).length,
    INTERVIEW: ivTotal.filter(k=>progress[k]).length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin  { to { transform:rotate(360deg) } }
        @keyframes blink { 50% { opacity:0 } }
        .rp-root { min-height:100vh; background:#080808; font-family:'IBM Plex Mono',monospace; padding:calc(var(--navbar-height,56px)) 0 80px; color:#e8e8e8; }
        .rp-grid { position:fixed; inset:0; opacity:0.025; pointer-events:none; background-image:linear-gradient(rgba(245,158,11,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.4) 1px,transparent 1px); background-size:80px 80px; }
        .rp-sticky { position:sticky; top:var(--navbar-height,56px); z-index:100; background:rgba(8,8,8,0.95); backdrop-filter:blur(20px); border-bottom:1px solid rgba(245,158,11,0.15); }
        .rp-sticky-inner { max-width:1200px; margin:0 auto; padding:0 40px; }
        .rp-hero-block { padding:28px 0 0; }
        .rp-stat-row { display:flex; gap:0; border-top:1px solid rgba(255,255,255,0.06); margin-top:20px; }
        .rp-stat-cell { padding:12px 20px; border-right:1px solid rgba(255,255,255,0.06); flex:1; }
        .rp-stat-cell:last-child { border-right:none; }
        .rp-stat-label { font-size:8px; letter-spacing:0.18em; color:rgba(232,232,232,0.25); margin-bottom:4px; text-transform:uppercase; }
        .rp-stat-value { font-family:'Bebas Neue',sans-serif; font-size:20px; color:#f59e0b; letter-spacing:0.04em; }
        .rp-tabs { display:flex; border-top:1px solid rgba(255,255,255,0.06); }
        .rp-tab { padding:13px 22px; font-size:10px; letter-spacing:0.14em; color:rgba(232,232,232,0.35); cursor:pointer; background:none; border:none; font-family:'IBM Plex Mono',monospace; position:relative; transition:color 0.2s; border-bottom:2px solid transparent; margin-bottom:-1px; }
        .rp-tab:hover { color:rgba(232,232,232,0.7); }
        .rp-tab.active { color:#f59e0b; border-bottom-color:#f59e0b; }
        .rp-content { max-width:1200px; margin:0 auto; padding:40px 40px; }
        .back-btn { display:inline-flex; align-items:center; gap:8px; padding:7px 16px; background:transparent; border:1px solid rgba(255,255,255,0.1); color:rgba(232,232,232,0.4); font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; cursor:pointer; border-radius:2px; transition:all 0.2s; margin-bottom:32px; }
        .back-btn:hover { border-color:rgba(245,158,11,0.4); color:#f59e0b; }
        .week-card { display:grid; grid-template-columns:64px 1fr; gap:0; margin-bottom:2px; }
        .week-spine { display:flex; flex-direction:column; align-items:center; position:relative; padding-top:20px; }
        .week-spine::after { content:''; position:absolute; top:56px; bottom:-2px; width:1px; background:linear-gradient(to bottom,rgba(245,158,11,0.2),transparent); }
        .week-card:last-child .week-spine::after { display:none; }
        .week-num { width:36px; height:36px; border:1px solid rgba(245,158,11,0.3); background:rgba(245,158,11,0.06); display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:16px; color:#f59e0b; z-index:1; }
        .week-body { padding:16px 0 24px 20px; border-bottom:1px solid rgba(255,255,255,0.04); }
        .proj-card { border:1px solid rgba(255,255,255,0.07); border-radius:2px; overflow:hidden; background:#0a0a0a; transition:border-color 0.2s; }
        .proj-card:hover { border-color:rgba(245,158,11,0.25); }
        .proj-stripe { height:2px; }
        .beginner .proj-stripe  { background:linear-gradient(90deg,#22c55e,#34d399); }
        .intermediate .proj-stripe { background:linear-gradient(90deg,#f59e0b,#fbbf24); }
        .advanced .proj-stripe  { background:linear-gradient(90deg,#ef4444,#f87171); }
        .iv-card { border:1px solid rgba(255,255,255,0.07); border-radius:2px; background:#0a0a0a; overflow:hidden; transition:border-color 0.2s; }
        .iv-card:hover { border-color:rgba(245,158,11,0.2); }
        .q-item { display:flex; gap:10px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:12px; color:rgba(232,232,232,0.55); line-height:1.5; }
        .q-item:last-child { border-bottom:none; }
        .q-num { font-size:8px; letter-spacing:0.1em; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); color:#f59e0b; width:24px; height:18px; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; border-radius:1px; }
      `}</style>

      <div className="rp-root">
        <div className="rp-grid" />

        {/* ── Sticky header ── */}
        <div className="rp-sticky">
          <div className="rp-sticky-inner">
            <div className="rp-hero-block">
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <span style={{ fontSize:9, letterSpacing:"0.2em", color:"rgba(245,158,11,0.5)" }}>CAREER ROADMAP</span>
                    <span style={{ color:"rgba(255,255,255,0.1)" }}>·</span>
                    {level && <span style={{ fontSize:9, letterSpacing:"0.12em", color:"rgba(232,232,232,0.3)" }}>{level.toUpperCase()}</span>}
                    {/* Saving indicator */}
                    {saving && (
                      <span style={{ fontSize:9, letterSpacing:"0.1em", color:"rgba(245,158,11,0.4)", display:"flex", alignItems:"center", gap:4 }}>
                        <div style={{ width:6, height:6, border:"1px solid rgba(245,158,11,0.4)", borderTopColor:"#f59e0b", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
                        SAVING...
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(24px,3.5vw,44px)", letterSpacing:"0.04em", lineHeight:1, textTransform:"uppercase", color:"#f0f0f0" }}>
                    {(raw?.title || role).toUpperCase()}
                  </h1>
                </div>

                {/* ── Progress ring ── */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                  <ProgressRing pct={pct} />
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:"0.12em", color:"rgba(232,232,232,0.3)" }}>
                    {pct >= 100 ? "COMPLETE ✓" : "PROGRESS"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rp-stat-row">
              {[
                { label:"LEVEL",    value:level||"CUSTOM" },
                { label:"DAILY",    value:timePerDay||"—" },
                { label:"DURATION", value:duration||"—"   },
                { label:"PHASES",   value:phases.length   },
                { label:"WEEKS",    value:weekly.length||"—" },
              ].map((s,i) => (
                <div key={i} className="rp-stat-cell">
                  <div className="rp-stat-label">{s.label}</div>
                  <div className="rp-stat-value">{String(s.value).toUpperCase()}</div>
                </div>
              ))}
              {/* Overall progress bar cell */}
              <div className="rp-stat-cell" style={{ minWidth:140 }}>
                <div className="rp-stat-label">COMPLETION</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:2 }}>
                  <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", background: pct>=100?"#22c55e":pct>=60?"#f59e0b":"#60a5fa", borderRadius:2, width:`${pct}%`, transition:"width 0.5s ease, background 0.3s" }} />
                  </div>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color: pct>=100?"#22c55e":pct>=60?"#f59e0b":"#60a5fa" }}>{pct}%</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="rp-tabs">
              {TABS.map(t => {
                const total = counts[t];
                const done  = sectionDone[t];
                return (
                  <button key={t} className={`rp-tab${tab===t?" active":""}`} onClick={() => setTab(t)}>
                    {t}
                    {total > 0 && (
                      <span style={{
                        display:"inline-flex", alignItems:"center", justifyContent:"center",
                        padding:"1px 6px", borderRadius:2, marginLeft:8,
                        background: done===total ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.12)",
                        color: done===total ? "#22c55e" : "#f59e0b",
                        fontSize:9, fontFamily:"'IBM Plex Mono',monospace",
                        border: `1px solid ${done===total ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.2)"}`,
                      }}>
                        {done}/{total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="rp-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>

          {error && (
            <div style={{ padding:"16px 20px", background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:2, color:"#fca5a5", fontSize:12, marginBottom:32 }}>
              ✕ {error}
            </div>
          )}

          {/* ── PHASES ── */}
          {tab==="PHASES" && (
            <motion.div key="phases" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:"0.04em" }}>LEARNING PHASES</div>
                <span style={{ fontSize:10, color:"rgba(232,232,232,0.3)", letterSpacing:"0.1em" }}>{phases.length} PHASES · CLICK TO EXPAND</span>
              </div>
              {phases.length
                ? phases.map((p,i) => <PhaseBlock key={i} phase={p} index={i} defaultOpen={i===0} progress={progress} setProgress={setProgress} />)
                : <div style={{ textAlign:"center", padding:"48px", color:"rgba(232,232,232,0.25)", fontSize:12 }}>No phase data available</div>
              }
            </motion.div>
          )}

          {/* ── WEEKLY ── */}
          {tab==="WEEKLY" && (
            <motion.div key="weekly" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:"0.04em", marginBottom:32 }}>WEEKLY SCHEDULE</div>
              {weekly.length ? (
                <div>
                  {weekly.map((w,i) => {
                    const key  = `week-${i}`;
                    const done = !!progress[key];
                    return (
                      <div key={i} className="week-card" style={{ opacity: done ? 0.7 : 1, transition:"opacity 0.2s" }}>
                        <div className="week-spine">
                          <div className="week-num" style={{ borderColor: done ? "rgba(34,197,94,0.5)" : "rgba(245,158,11,0.3)", background: done ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.06)", color: done ? "#22c55e" : "#f59e0b" }}>
                            {done ? "✓" : `W${w.week}`}
                          </div>
                        </div>
                        <div className="week-body">
                          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:14 }}>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:600, color: done ? "rgba(34,197,94,0.7)" : "#f0f0f0", textDecoration: done ? "line-through" : "none", transition:"all 0.2s" }}>
                              {w.focus || `Week ${w.week}`}
                            </div>
                            <Checkbox checked={done} onChange={v => setProgress(p => ({ ...p, [key]: v }))} size={18} />
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:12 }}>
                            {w.topics_to_cover?.length > 0 && (
                              <div>
                                <div style={{ fontSize:8, letterSpacing:"0.18em", color:"rgba(245,158,11,0.5)", marginBottom:8 }}>TOPICS</div>
                                {w.topics_to_cover.map((t,j) => <div key={j} style={{ display:"flex", gap:8, fontSize:11, color:"rgba(232,232,232,0.45)", lineHeight:1.8 }}><span style={{ color:"rgba(245,158,11,0.3)" }}>▸</span>{String(t)}</div>)}
                              </div>
                            )}
                            {w.practice_goals?.length > 0 && (
                              <div>
                                <div style={{ fontSize:8, letterSpacing:"0.18em", color:"rgba(96,165,250,0.5)", marginBottom:8 }}>PRACTICE</div>
                                {w.practice_goals.map((g,j) => <div key={j} style={{ display:"flex", gap:8, fontSize:11, color:"rgba(232,232,232,0.45)", lineHeight:1.8 }}><span style={{ color:"rgba(96,165,250,0.3)" }}>▸</span>{String(g)}</div>)}
                              </div>
                            )}
                          </div>
                          {w.project_milestone && (
                            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"rgba(52,211,153,0.05)", border:"1px solid rgba(52,211,153,0.15)", borderRadius:2, fontSize:11, color:"rgba(52,211,153,0.8)" }}>
                              <span>✓</span>{w.project_milestone}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div style={{ textAlign:"center", padding:"48px", color:"rgba(232,232,232,0.25)", fontSize:12 }}>No weekly plan available</div>}
            </motion.div>
          )}

          {/* ── PROJECTS ── */}
          {tab==="PROJECTS" && (
            <motion.div key="projects" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:"0.04em", marginBottom:32 }}>BUILD PROJECTS</div>
              {Object.keys(projects).length ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
                  {["beginner","intermediate","advanced"].flatMap(lvl =>
                    (projects[lvl]||[]).map((p,i) => {
                      const key  = `project-${lvl}-${i}`;
                      const done = !!progress[key];
                      return (
                        <div key={`${lvl}-${i}`} className={`proj-card ${lvl}`} style={{ opacity: done ? 0.75 : 1, transition:"opacity 0.2s", border: done ? "1px solid rgba(34,197,94,0.25)" : undefined }}>
                          <div className="proj-stripe" />
                          <div style={{ padding:20 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:"0.18em", padding:"3px 8px", border:`1px solid ${lvl==="beginner"?"rgba(34,197,94,0.3)":lvl==="intermediate"?"rgba(245,158,11,0.3)":"rgba(239,68,68,0.3)"}`, borderRadius:2, color:lvl==="beginner"?"#22c55e":lvl==="intermediate"?"#f59e0b":"#ef4444", display:"inline-block" }}>
                                {done ? "✓ DONE" : lvl.toUpperCase()}
                              </span>
                              <Checkbox checked={done} onChange={v => setProgress(pr => ({ ...pr, [key]: v }))} size={18} />
                            </div>
                            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:"0.04em", color: done ? "rgba(34,197,94,0.8)" : "#f0f0f0", marginBottom:8, textDecoration: done ? "line-through" : "none", transition:"all 0.2s" }}>
                              {(p.title||"PROJECT").toUpperCase()}
                            </div>
                            {p.description && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"rgba(232,232,232,0.4)", lineHeight:1.6, marginBottom:16 }}>{p.description}</div>}
                            {p.features?.length > 0 && (
                              <div style={{ marginBottom:12 }}>
                                <div style={{ fontSize:8, letterSpacing:"0.16em", color:"rgba(96,165,250,0.5)", marginBottom:8 }}>FEATURES</div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                                  {p.features.map((f,fi) => <span key={fi} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, padding:"3px 8px", border:"1px solid rgba(96,165,250,0.2)", borderRadius:2, color:"rgba(96,165,250,0.7)" }}>{f}</span>)}
                                </div>
                              </div>
                            )}
                            {p.core_topics_used?.length > 0 && (
                              <div>
                                <div style={{ fontSize:8, letterSpacing:"0.16em", color:"rgba(245,158,11,0.5)", marginBottom:8 }}>TECH STACK</div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                                  {p.core_topics_used.map((t,ti) => <span key={ti} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, padding:"3px 8px", border:"1px solid rgba(245,158,11,0.2)", borderRadius:2, color:"rgba(245,158,11,0.7)" }}>{t}</span>)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : <div style={{ textAlign:"center", padding:"48px", color:"rgba(232,232,232,0.25)", fontSize:12 }}>No projects available</div>}
            </motion.div>
          )}

          {/* ── INTERVIEW ── */}
          {tab==="INTERVIEW" && (
            <motion.div key="interview" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:"0.04em", marginBottom:32 }}>INTERVIEW PREP</div>
              {interview.length ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:12 }}>
                  {interview.map((s,i) => {
                    const key  = `interview-${i}`;
                    const done = !!progress[key];
                    return (
                      <div key={i} className="iv-card" style={{ border: done ? "1px solid rgba(34,197,94,0.25)" : undefined, opacity: done ? 0.8 : 1, transition:"all 0.2s" }}>
                        <div style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"18px 20px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                            <div style={{ fontSize:9, letterSpacing:"0.18em", color:"rgba(245,158,11,0.5)" }}>STAGE {String(i+1).padStart(2,"0")}</div>
                            <Checkbox checked={done} onChange={v => setProgress(p => ({ ...p, [key]: v }))} size={18} />
                          </div>
                          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color: done ? "#22c55e" : "#f0f0f0", textDecoration: done ? "line-through" : "none", transition:"all 0.2s" }}>
                            {(s.stage||`STAGE ${i+1}`).toUpperCase()}
                          </div>
                          {s.focus_areas?.length > 0 && (
                            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:12 }}>
                              {s.focus_areas.map((a,ai) => <span key={ai} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:"0.08em", padding:"3px 8px", border:"1px solid rgba(245,158,11,0.2)", borderRadius:2, color:"rgba(245,158,11,0.6)" }}>{String(a)}</span>)}
                            </div>
                          )}
                        </div>
                        <div style={{ padding:"16px 20px" }}>
                          {s.common_questions?.length > 0 && (
                            <div style={{ marginBottom:16 }}>
                              <div style={{ fontSize:8, letterSpacing:"0.16em", color:"rgba(232,232,232,0.25)", marginBottom:10 }}>COMMON QUESTIONS</div>
                              {s.common_questions.map((q,qi) => (
                                <div key={qi} className="q-item">
                                  <div className="q-num">Q{qi+1}</div>
                                  <div>{String(q)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {s.mock_strategy && (
                            <div style={{ padding:"10px 12px", background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:2, fontSize:11, color:"rgba(245,158,11,0.7)", lineHeight:1.6 }}>
                              💡 {s.mock_strategy}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div style={{ textAlign:"center", padding:"48px", color:"rgba(232,232,232,0.25)", fontSize:12 }}>No interview prep available</div>}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}