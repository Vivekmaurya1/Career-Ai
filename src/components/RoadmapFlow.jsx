import { useState, useEffect, useRef, useCallback } from "react";

/* ── tiny spring-like counter for animated numbers ── */
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(start + diff * ease));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

function Confetti({ active }) {
  if (!active) return null;
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: ["#a78bfa","#60a5fa","#34d399","#fbbf24","#f87171","#c084fc"][i % 6],
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    size: 5 + Math.random() * 6,
  }));
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", borderRadius:"inherit" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:"30%",
          width: p.size, height: p.size,
          background: p.color, borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animation: `confettiFall 1.2s ${p.delay}s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

function AnimatedCheck({ visible, color = "#34d399" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ overflow:"visible" }}>
      <circle cx="7" cy="7" r="6.5" stroke={color} strokeWidth="1"
        fill={visible ? `${color}22` : "transparent"}
        style={{ transition: "fill 0.3s" }}
      />
      <path d="M4 7l2.5 2.5L10 5" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        style={{
          strokeDasharray: 10,
          strokeDashoffset: visible ? 0 : 10,
          transition: "stroke-dashoffset 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </svg>
  );
}

function SparkleRing({ flash }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (flash) { setShow(true); const t = setTimeout(() => setShow(false), 700); return () => clearTimeout(t); }
  }, [flash]);
  if (!show) return null;
  return (
    <div style={{
      position:"absolute", inset: -8, borderRadius: "50%",
      border: "2px solid #34d399",
      animation: "sparkleRing 0.7s ease-out forwards",
      pointerEvents: "none",
    }} />
  );
}

const PHASE_THEMES = [
  { gradient:"135deg,#1e0533,#0d0021", accent:"#c084fc", glow:"rgba(192,132,252,0.2)", border:"rgba(192,132,252,0.25)", tag:"#7c3aed" },
  { gradient:"135deg,#001a40,#00080f", accent:"#60a5fa", glow:"rgba(96,165,250,0.2)",  border:"rgba(96,165,250,0.25)",  tag:"#2563eb" },
  { gradient:"135deg,#00282e,#000d10", accent:"#22d3ee", glow:"rgba(34,211,238,0.2)",  border:"rgba(34,211,238,0.25)",  tag:"#0891b2" },
  { gradient:"135deg,#00200f,#000a05", accent:"#4ade80", glow:"rgba(74,222,128,0.2)",  border:"rgba(74,222,128,0.25)",  tag:"#16a34a" },
  { gradient:"135deg,#1f1000,#0a0700", accent:"#fbbf24", glow:"rgba(251,191,36,0.2)",  border:"rgba(251,191,36,0.25)",  tag:"#d97706" },
  { gradient:"135deg,#200008,#0a0003", accent:"#fb7185", glow:"rgba(251,113,133,0.2)", border:"rgba(251,113,133,0.25)", tag:"#e11d48" },
];

export default function RoadmapFlow({ roadmap }) {
  const storageKey = `rmp-v2-${(roadmap?.title || roadmap?.role || "x").toLowerCase().replace(/\s+/g,"-")}`;

  const [checked, setChecked] = useState(() => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [expanded, setExpanded] = useState(() => {
    const o = {}; (roadmap?.phases||[]).forEach((_,i) => { o[i]=true; }); return o;
  });
  const [justChecked, setJustChecked] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Read navbar height from CSS custom property set by Navbar component
  const [navbarHeight, setNavbarHeight] = useState(64);
  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    const h = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--navbar-height")) || 64;
    setNavbarHeight(h);
  }, []);

  const toggle = useCallback((id) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
    setJustChecked(id);
    setTimeout(() => setJustChecked(null), 800);
  }, [storageKey]);

  const togglePhase = useCallback((i) => {
    setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
  }, []);

  if (!roadmap?.phases?.length) return null;

  const totalTopics = roadmap.phases.reduce((a,p) => a+(p.topics?.length||0), 0);
  const completedTopics = Object.values(checked).filter(Boolean).length;
  const totalPhases = roadmap.phases.length;
  const completedPhases = roadmap.phases.filter((p,pi) =>
    p.topics?.every((_,ti) => checked[`topic-${pi}-${ti}`])
  ).length;
  const progress = totalTopics > 0 ? Math.round((completedTopics/totalTopics)*100) : 0;
  const animProgress = useCountUp(progress);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rm2 {
          font-family: 'Outfit', sans-serif;
          background: #060610;
          min-height: 100vh;
          /* Push content below the fixed navbar */
          padding-top: var(--navbar-height, 64px);
          padding-bottom: 100px;
          position: relative;
          overflow-x: hidden;
        }

        .rm2-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(109,40,217,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 90% 100%, rgba(37,99,235,0.06) 0%, transparent 60%);
        }
        .rm2-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.025;
          background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── STICKY HEADER — sits directly below the fixed navbar ── */
        .rm2-header {
          position: sticky;
          /* top = navbar height so it sticks right below it, not under it */
          top: var(--navbar-height, 64px);
          z-index: 100;
          background: rgba(6,6,16,0.9);
          backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 32px;
        }
        .rm2-header-inner {
          max-width: 900px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 0; gap: 16px; flex-wrap: wrap;
        }
        .rm2-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #7c3aed; margin-bottom: 3px;
          display: flex; align-items: center; gap: 6px;
        }
        .rm2-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #7c3aed;
          box-shadow: 0 0 8px #7c3aed; animation: dotPulse 2.5s ease-in-out infinite;
        }
        .rm2-title { font-size: 20px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em; line-height: 1.15; }

        .rm2-stats { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .rm2-stat {
          position: relative; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 8px 16px; display: flex; flex-direction: column;
          align-items: center; gap: 1px; min-width: 64px; overflow: hidden; transition: border-color 0.3s;
        }
        .rm2-stat-val { font-size: 16px; font-weight: 700; line-height: 1; transition: color 0.3s; }
        .rm2-stat-lbl { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; color: #475569; }

        /* ── PROGRESS ── */
        .rm2-prog-wrap { background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.04); padding: 12px 32px; }
        .rm2-prog-inner { max-width: 900px; margin: 0 auto; }
        .rm2-prog-meta { display: flex; justify-content: space-between; margin-bottom: 7px; }
        .rm2-prog-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #334155; }
        .rm2-prog-val { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #7c3aed; }
        .rm2-prog-track { height: 8px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; position: relative; }
        .rm2-prog-fill {
          height: 100%; border-radius: 99px; position: relative; overflow: hidden;
          transition: width 0.9s cubic-bezier(0.34,1.4,0.64,1);
        }
        .rm2-prog-fill::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: shimmer 2.5s ease-in-out infinite;
        }

        /* ── BODY ── */
        .rm2-body { max-width: 900px; margin: 0 auto; padding: 40px 32px 0; display: flex; flex-direction: column; gap: 20px; }

        /* ── PHASE ── */
        .rm2-phase { position: relative; z-index: 2; border-radius: 20px; border: 1px solid; overflow: hidden; transition: box-shadow 0.4s, border-color 0.4s; }
        .rm2-phase-hd {
          padding: 20px 22px; cursor: pointer; user-select: none;
          display: flex; align-items: center; justify-content: space-between;
          position: relative; overflow: hidden; transition: filter 0.2s;
        }
        .rm2-phase-hd:hover { filter: brightness(1.1); }
        .rm2-phase-hd-left { display: flex; align-items: center; gap: 16px; }
        .rm2-phase-icon {
          width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
          position: relative; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rm2-phase-hd:hover .rm2-phase-icon { transform: scale(1.1) rotate(-3deg); }
        .rm2-phase-icon-ring {
          position: absolute; inset: -3px; border-radius: 17px; border: 1.5px solid; opacity: 0.4;
          animation: iconRingSpin 8s linear infinite;
        }
        .rm2-phase-tag { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 3px; opacity: 0.7; }
        .rm2-phase-name { font-size: 17px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.01em; }
        .rm2-phase-hd-right { display: flex; align-items: center; gap: 12px; }
        .rm2-phase-ring { width: 44px; height: 44px; flex-shrink: 0; position: relative; }
        .rm2-phase-ring svg { transform: rotate(-90deg); }
        .rm2-phase-ring-pct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500; }
        .rm2-phase-chevron {
          width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07);
          transition: background 0.2s;
        }
        .rm2-phase-hd:hover .rm2-phase-chevron { background: rgba(255,255,255,0.1); }

        .rm2-phase-body { overflow: hidden; transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease; }
        .rm2-phase-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 0 20px; }

        /* ── TOPICS ── */
        .rm2-topics { padding: 14px 18px 18px; display: flex; flex-direction: column; gap: 6px; }
        .rm2-topic {
          display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);
          cursor: pointer; position: relative; overflow: hidden;
          transition: background 0.25s, border-color 0.25s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rm2-topic:hover { background: rgba(255,255,255,0.045); transform: translateX(4px); }
        .rm2-topic.rm2-done { background: rgba(20,83,45,0.2); border-color: rgba(52,211,153,0.2); }
        .rm2-topic.rm2-just-checked { animation: topicPop 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        .rm2-topic-idx { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #1e293b; min-width: 18px; flex-shrink: 0; transition: color 0.3s; }
        .rm2-topic.rm2-done .rm2-topic-idx { color: rgba(52,211,153,0.4); }
        .rm2-topic-check {
          width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02);
          transition: border-color 0.3s, background 0.3s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
        }
        .rm2-topic:hover .rm2-topic-check { border-color: rgba(255,255,255,0.2); transform: scale(1.08); }
        .rm2-topic.rm2-done .rm2-topic-check { border-color: #34d399; background: rgba(52,211,153,0.15); }
        .rm2-topic-label { flex: 1; font-size: 14px; font-weight: 500; color: #94a3b8; line-height: 1.4; transition: color 0.3s; }
        .rm2-topic.rm2-done .rm2-topic-label { color: #6ee7b7; text-decoration: line-through; opacity: 0.7; }
        .rm2-topic-badge {
          font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.08em; padding: 3px 8px;
          border-radius: 6px; background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2);
          opacity: 0; transform: scale(0.8); transition: opacity 0.3s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rm2-topic.rm2-done .rm2-topic-badge { opacity: 1; transform: scale(1); }

        /* ── PROJECT ── */
        .rm2-project {
          margin: 4px 18px 18px; border-radius: 16px; border: 1px solid rgba(96,165,250,0.2);
          background: linear-gradient(135deg, rgba(30,58,138,0.25), rgba(15,36,96,0.15));
          padding: 16px 18px; position: relative; overflow: hidden;
          animation: projectReveal 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        .rm2-project::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(96,165,250,0.4), transparent); }
        .rm2-project-hd { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .rm2-project-icon { font-size: 20px; animation: rocketFloat 3s ease-in-out infinite; }
        .rm2-project-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #60a5fa; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 2px; }
        .rm2-project-name { font-size: 13px; font-weight: 600; color: #93c5fd; }
        .rm2-project-item { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; }
        .rm2-project-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; margin-top: 6px; flex-shrink: 0; box-shadow: 0 0 8px rgba(59,130,246,0.5); }
        .rm2-project-text { font-size: 13px; color: #bfdbfe; line-height: 1.5; }

        /* ── WIN ── */
        .rm2-win { max-width: 900px; margin: 0 auto; }
        .rm2-win-card {
          border-radius: 20px; background: linear-gradient(135deg, rgba(5,150,105,0.15), rgba(4,120,87,0.08));
          border: 1px solid rgba(52,211,153,0.25); padding: 28px 32px;
          display: flex; align-items: center; gap: 20px;
          animation: winBounce 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
          position: relative; overflow: hidden;
        }
        .rm2-win-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.1), transparent 60%); }
        .rm2-win-emoji { font-size: 40px; animation: trophy 2s ease-in-out infinite; }
        .rm2-win-h { font-size: 22px; font-weight: 700; color: #34d399; letter-spacing: -0.02em; margin-bottom: 4px; }
        .rm2-win-sub { font-size: 14px; color: #6ee7b7; opacity: 0.75; }

        /* ── CONNECTOR ── */
        .rm2-connector { display: flex; justify-content: center; align-items: center; height: 28px; }
        .rm2-connector-line { width: 1px; height: 100%; background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)); }
        .rm2-connector-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.08); margin: 0 -0.5px; }

        /* ── KEYFRAMES ── */
        @keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }
        @keyframes dotPulse { 0%,100% { box-shadow: 0 0 6px #7c3aed; opacity: 1; } 50% { box-shadow: 0 0 14px #a78bfa; opacity: 0.6; } }
        @keyframes phaseIn { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes topicPop { 0% { transform: translateX(4px) scale(1); } 40% { transform: translateX(4px) scale(1.025); } 100% { transform: translateX(4px) scale(1); } }
        @keyframes projectReveal { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes winBounce { from { opacity: 0; transform: scale(0.85) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes iconRingSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rocketFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(5deg); } }
        @keyframes trophy { 0%,100% { transform: rotate(-5deg) scale(1); } 50% { transform: rotate(5deg) scale(1.05); } }
        @keyframes confettiFall { 0% { opacity: 1; transform: translateY(0) rotate(0deg); } 100% { opacity: 0; transform: translateY(120px) rotate(360deg); } }
        @keyframes sparkleRing { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 640px) {
          .rm2-header { padding: 0 18px; }
          .rm2-body { padding: 24px 18px 0; }
          .rm2-prog-wrap { padding: 12px 18px; }
          .rm2-header-inner { flex-direction: column; align-items: flex-start; gap: 10px; padding: 12px 0; }
        }
      `}</style>

      <div className="rm2-bg" />
      <div className="rm2-grid" />

      <div className="rm2" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s" }}>

        {/* ── STICKY HEADER (sits below fixed Navbar) ── */}
        <div className="rm2-header">
          <div className="rm2-header-inner">
            <div>
              <div className="rm2-eyebrow">
                <div className="rm2-eyebrow-dot" />
                Your Learning Path
              </div>
              <div className="rm2-title">{roadmap.title || "Learning Roadmap"}</div>
            </div>
            <div className="rm2-stats">
              {[
                { val: completedTopics, suffix: `/${totalTopics}`, lbl: "Topics",  color: "#c084fc" },
                { val: completedPhases, suffix: `/${totalPhases}`, lbl: "Phases",  color: "#60a5fa" },
                { val: animProgress,    suffix: "%",               lbl: "Done",    color: progress===100?"#34d399":"#fbbf24" },
              ].map(s => (
                <div className="rm2-stat" key={s.lbl} style={{ borderColor:`${s.color}22`, background:`${s.color}09` }}>
                  <div className="rm2-stat-val" style={{ color: s.color }}>{s.val}{s.suffix}</div>
                  <div className="rm2-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div className="rm2-prog-wrap">
          <div className="rm2-prog-inner">
            <div className="rm2-prog-meta">
              <span className="rm2-prog-label">Overall Progress</span>
              <span className="rm2-prog-val">{completedTopics} of {totalTopics} topics complete</span>
            </div>
            <div className="rm2-prog-track">
              <div className="rm2-prog-fill" style={{
                width: `${progress}%`,
                background: progress===100 ? "linear-gradient(90deg,#34d399,#10b981)" : "linear-gradient(90deg,#6d28d9,#8b5cf6,#c084fc)",
                boxShadow: `0 0 16px ${progress===100?"rgba(52,211,153,0.35)":"rgba(139,92,246,0.35)"}`,
              }} />
            </div>
          </div>
        </div>

        {/* ── COMPLETION BANNER ── */}
        {progress===100 && (
          <div className="rm2-win" style={{ padding:"32px 32px 0" }}>
            <div className="rm2-win-card">
              <div className="rm2-win-emoji">🏆</div>
              <div>
                <div className="rm2-win-h">Roadmap Complete!</div>
                <div className="rm2-win-sub">You've conquered all {totalTopics} topics across {totalPhases} phases.</div>
              </div>
            </div>
          </div>
        )}

        {/* ── PHASES ── */}
        <div className="rm2-body">
          {roadmap.phases.map((phase, pi) => {
            const theme = PHASE_THEMES[pi % PHASE_THEMES.length];
            const topicCount = phase.topics?.length || 0;
            const doneCount = (phase.topics||[]).filter((_,ti) => checked[`topic-${pi}-${ti}`]).length;
            const phaseProgress = topicCount>0 ? Math.round((doneCount/topicCount)*100) : 0;
            const phaseComplete = doneCount===topicCount && topicCount>0;
            const isOpen = expanded[pi]!==false;
            const phaseIcons = ["🧱","⚙️","🔗","🧠","🎯","🛠️","🌐","🔬","✨","🚀"];
            const R = 16, circ = 2*Math.PI*R, dash = circ*(phaseProgress/100);

            return (
              <div key={pi} style={{ animation: `phaseIn 0.5s ${0.05*pi}s cubic-bezier(0.22,1,0.36,1) both` }}>
                {pi>0 && (
                  <div className="rm2-connector" style={{ marginBottom:4 }}>
                    <div className="rm2-connector-line" />
                    <div className="rm2-connector-dot" />
                    <div className="rm2-connector-line" />
                  </div>
                )}

                <div className="rm2-phase" style={{
                  borderColor: phaseComplete ? "rgba(52,211,153,0.3)" : theme.border,
                  background: `linear-gradient(${theme.gradient})`,
                  boxShadow: isOpen ? `0 8px 40px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : `inset 0 1px 0 rgba(255,255,255,0.04)`,
                }}>
                  <Confetti active={phaseComplete} />

                  <div className="rm2-phase-hd" onClick={() => togglePhase(pi)}>
                    <div className="rm2-phase-hd-left">
                      <div className="rm2-phase-icon" style={{ background:`${theme.accent}18` }}>
                        <div className="rm2-phase-icon-ring" style={{ borderColor: theme.accent }} />
                        <span style={{ position:"relative", zIndex:1 }}>{phaseIcons[pi%phaseIcons.length]}</span>
                      </div>
                      <div>
                        <div className="rm2-phase-tag" style={{ color: theme.accent }}>Phase {pi+1} · {topicCount} topics</div>
                        <div className="rm2-phase-name">{phase.phase_title}</div>
                      </div>
                    </div>
                    <div className="rm2-phase-hd-right">
                      <div className="rm2-phase-ring">
                        <svg width="44" height="44" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
                          <circle cx="22" cy="22" r={R} fill="none"
                            stroke={phaseComplete?"#34d399":theme.accent} strokeWidth="3"
                            strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
                            style={{ transition:"stroke-dasharray 0.7s cubic-bezier(0.34,1.4,0.64,1)", filter:`drop-shadow(0 0 4px ${phaseComplete?"#34d399":theme.accent})` }}
                          />
                        </svg>
                        <div className="rm2-phase-ring-pct" style={{ color: phaseComplete?"#34d399":theme.accent }}>
                          {doneCount}/{topicCount}
                        </div>
                      </div>
                      <div className="rm2-phase-chevron">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                          style={{ transform: isOpen?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
                        >
                          <path d="M2 4l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="rm2-phase-body" style={{
                    maxHeight: isOpen ? `${topicCount*70+200}px` : "0px",
                    opacity: isOpen ? 1 : 0,
                  }}>
                    <div className="rm2-phase-divider" />
                    <div className="rm2-topics">
                      {(phase.topics||[]).map((topic, ti) => {
                        const topicId = `topic-${pi}-${ti}`;
                        const isDone = !!checked[topicId];
                        const isJust = justChecked===topicId;
                        return (
                          <div key={ti}
                            className={`rm2-topic${isDone?" rm2-done":""}${isJust?" rm2-just-checked":""}`}
                            style={{ animation:`fadeSlideUp 0.35s ${0.04*ti}s ease both` }}
                            onClick={() => toggle(topicId)}
                          >
                            <div style={{
                              position:"absolute", left:0, top:0, bottom:0, width:3, borderRadius:"99px 0 0 99px",
                              background: isDone ? "#34d399" : "transparent",
                              boxShadow: isDone ? "0 0 8px rgba(52,211,153,0.5)" : "none",
                              transition:"background 0.3s, box-shadow 0.3s",
                            }} />
                            <span className="rm2-topic-idx">#{String(ti+1).padStart(2,"0")}</span>
                            <div className="rm2-topic-check">
                              <SparkleRing flash={isJust} />
                              <AnimatedCheck visible={isDone} color={isDone?"#34d399":theme.accent} />
                            </div>
                            <span className="rm2-topic-label">{topic}</span>
                            <span className="rm2-topic-badge">DONE</span>
                          </div>
                        );
                      })}
                    </div>

                    {phaseComplete && roadmap.projects?.beginner?.length>0 && (
                      <div className="rm2-project">
                        <div className="rm2-project-hd">
                          <span className="rm2-project-icon">🚀</span>
                          <div>
                            <div className="rm2-project-label">Phase Project Unlocked</div>
                            <div className="rm2-project-name">{phase.phase_title}</div>
                          </div>
                        </div>
                        {roadmap.projects.beginner.map((p,i) => (
                          <div key={i} className="rm2-project-item">
                            <div className="rm2-project-dot" />
                            <span className="rm2-project-text">{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}