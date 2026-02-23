// src/pages/landing.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

/* ── SHARED STYLES ── */
const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
  :root {
    --bg: #080808; --surface: #0e0e0e; --border: rgba(255,255,255,0.07);
    --amber: #f59e0b; --amber-dim: rgba(245,158,11,0.1); --amber-glow: rgba(245,158,11,0.25);
    --text: #e8e8e8; --muted: rgba(232,232,232,0.45); --dim: rgba(232,232,232,0.18);
    --mono: 'IBM Plex Mono', monospace; --display: 'Bebas Neue', sans-serif;
    --navbar-height: 56px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); }
  ::selection { background: var(--amber); color: #080808; }
`;

/* ── SCANLINE TEXTURE ── */
function Scanlines() {
  return (
    <div style={{
      position:"fixed", inset:0, pointerEvents:"none", zIndex:1000, opacity:0.03,
      backgroundImage:"repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 2px)",
      backgroundSize:"100% 2px",
    }} />
  );
}

/* ── GRID BG ── */
function GridBg() {
  return (
    <div style={{
      position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.04,
      backgroundImage:"linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)",
      backgroundSize:"80px 80px",
    }} />
  );
}

/* ── TYPEWRITER ── */
function Typewriter({ words, speed = 80 }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  const [wait, setWait] = useState(false);

  useEffect(() => {
    if (wait) { const t = setTimeout(() => setWait(false), 1800); return () => clearTimeout(t); }
    const target = words[idx];
    if (!del) {
      if (text.length < target.length) {
        const t = setTimeout(() => setText(target.slice(0, text.length + 1)), speed);
        return () => clearTimeout(t);
      } else { setWait(true); setDel(true); }
    } else {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), speed / 2);
        return () => clearTimeout(t);
      } else { setDel(false); setIdx((idx + 1) % words.length); }
    }
  }, [text, del, idx, wait, words, speed]);

  return (
    <span>
      {text}
      <span style={{ animation:"blink 1s step-end infinite", color:"#f59e0b" }}>_</span>
    </span>
  );
}

/* ── COUNTER ── */
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = () => {
          start += to / 60;
          if (start < to) { setVal(Math.floor(start)); requestAnimationFrame(step); }
          else setVal(to);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── HERO ── */
function Hero() {
  const navigate = useNavigate();
  const roles = ["Frontend Developer", "Data Scientist", "DevOps Engineer", "ML Engineer", "Backend Dev", "Product Manager"];
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0,1], ["0%", "25%"]);

  return (
    <section ref={ref} style={{ minHeight:"100vh", position:"relative", display:"flex", alignItems:"center", overflow:"hidden", paddingTop:"var(--navbar-height)" }}>
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes scanMove { from{background-position:0 0} to{background-position:0 100px} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
        .hero-btn-primary {
          display:inline-flex; align-items:center; gap:10px;
          padding:14px 32px; background:#f59e0b; color:#080808;
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700;
          letter-spacing:0.15em; border:none; cursor:pointer; border-radius:2px;
          transition:all 0.2s; position:relative; overflow:hidden;
        }
        .hero-btn-primary::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent);
          transform:translateX(-100%); transition:transform 0.4s;
        }
        .hero-btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(245,158,11,0.4); }
        .hero-btn-primary:hover::before { transform:translateX(100%); }
        .hero-btn-secondary {
          display:inline-flex; align-items:center; gap:10px;
          padding:13px 28px; background:transparent; color:rgba(232,232,232,0.6);
          font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.12em;
          border:1px solid rgba(255,255,255,0.15); cursor:pointer; border-radius:2px;
          transition:all 0.2s;
        }
        .hero-btn-secondary:hover { border-color:rgba(245,158,11,0.4); color:#f59e0b; }
        .stat-card {
          padding:16px 20px; border:1px solid var(--border); background:var(--surface);
          border-radius:2px; position:relative; overflow:hidden;
          transition:border-color 0.2s, transform 0.2s;
        }
        .stat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(245,158,11,0.4),transparent);
        }
        .stat-card:hover { border-color:rgba(245,158,11,0.3); transform:translateY(-2px); }
      `}</style>

      {/* BG decorations */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {/* Amber glow */}
        <div style={{ position:"absolute", top:"-20%", right:"-10%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,0.06),transparent 70%)" }} />
        {/* Circuit lines */}
        <svg style={{ position:"absolute", bottom:0, left:0, width:"100%", height:"40%", opacity:0.04 }} viewBox="0 0 1400 300" preserveAspectRatio="none">
          <path d="M0,150 L200,150 L250,100 L400,100 L450,150 L700,150" stroke="#f59e0b" strokeWidth="1" fill="none"/>
          <path d="M700,150 L900,150 L950,200 L1100,200 L1150,150 L1400,150" stroke="#f59e0b" strokeWidth="1" fill="none"/>
          <circle cx="700" cy="150" r="4" fill="#f59e0b"/>
        </svg>
        {/* Corner brackets */}
        {[[0,0,"top left"],[1,0,"top right"],[0,1,"bottom left"],[1,1,"bottom right"]].map(([x,y,label],i) => (
          <div key={i} style={{
            position:"absolute",
            [y===0?"top":"bottom"]: 80,
            [x===0?"left":"right"]: 40,
            width:30, height:30,
            borderTop: y===0 ? "1px solid rgba(245,158,11,0.3)" : undefined,
            borderBottom: y===1 ? "1px solid rgba(245,158,11,0.3)" : undefined,
            borderLeft: x===0 ? "1px solid rgba(245,158,11,0.3)" : undefined,
            borderRight: x===1 ? "1px solid rgba(245,158,11,0.3)" : undefined,
          }} />
        ))}
      </div>

      <motion.div style={{ y, maxWidth:1200, margin:"0 auto", padding:"80px 40px", position:"relative", zIndex:2, width:"100%" }} className="container">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          {/* Left */}
          <div>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b", boxShadow:"0 0 12px #f59e0b", animation:"blink 2s ease infinite" }} />
                <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.18em", color:"#f59e0b" }}>AI-POWERED CAREER INTELLIGENCE</span>
              </div>

              <h1 style={{ fontFamily:"var(--display)", fontSize:"clamp(56px,7vw,96px)", lineHeight:0.92, letterSpacing:"0.02em", marginBottom:20, textTransform:"uppercase" }}>
                LAND YOUR<br />
                <span style={{ color:"#f59e0b" }}>DREAM</span><br />
                <span style={{ WebkitTextFillColor:"transparent", WebkitTextStroke:"1.5px rgba(232,232,232,0.4)" }}>
                  <Typewriter words={roles} speed={70} />
                </span>
              </h1>

              <p style={{ fontFamily:"var(--mono)", fontSize:13, color:"var(--muted)", lineHeight:1.8, maxWidth:400, marginBottom:36 }}>
                Precision-built learning roadmaps. Topics, timelines, and projects — <span style={{ color:"var(--text)" }}>mapped by AI in seconds.</span>
              </p>

              <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:48 }}>
                <button className="hero-btn-primary" onClick={() => navigate("/generate")}>
                  GENERATE ROADMAP
                  <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                <button className="hero-btn-secondary" onClick={() => document.querySelector("#features")?.scrollIntoView({behavior:"smooth"})}>
                  VIEW FEATURES ↓
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {[
                  { n:2400, suffix:"+", label:"ROADMAPS GENERATED" },
                  { n:98, suffix:"%", label:"SATISFACTION RATE" },
                  { n:30, suffix:"s", label:"SETUP TIME" },
                ].map((s,i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontFamily:"var(--display)", fontSize:28, letterSpacing:"0.02em", color:"#f59e0b", lineHeight:1 }}>
                      <Counter to={s.n} suffix={s.suffix} />
                    </div>
                    <div style={{ fontFamily:"var(--mono)", fontSize:8, letterSpacing:"0.16em", color:"var(--dim)", marginTop:4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — Terminal mockup */}
          <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7, delay:0.2 }}>
            <div style={{
              background:"#0a0a0a", border:"1px solid rgba(245,158,11,0.2)", borderRadius:4,
              overflow:"hidden", fontFamily:"var(--mono)", fontSize:12,
              boxShadow:"0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(245,158,11,0.04)",
              animation:"floatY 6s ease-in-out infinite",
            }}>
              {/* Terminal bar */}
              <div style={{ background:"#0e0e0e", padding:"10px 16px", display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid rgba(245,158,11,0.1)" }}>
                {["#ef4444","#f59e0b","#22c55e"].map((c,i) => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:c }} />)}
                <span style={{ flex:1, textAlign:"center", fontSize:10, letterSpacing:"0.1em", color:"rgba(255,255,255,0.2)" }}>roadmap.json</span>
              </div>
              {/* Content */}
              <div style={{ padding:24 }}>
                {[
                  { key:"role",       val:'"Full Stack Engineer"', c:"#60a5fa", delay:0.4 },
                  { key:"level",      val:'"Intermediate"',       c:"#34d399", delay:0.5 },
                  { key:"phases",     val:"4",                    c:"#f59e0b", delay:0.6 },
                  { key:"topics",     val:"18",                   c:"#c084fc", delay:0.7 },
                  { key:"projects",   val:"6",                    c:"#f87171", delay:0.8 },
                  { key:"duration",   val:'"3 months"',           c:"#34d399", delay:0.9 },
                  { key:"progress",   val:'"42%"',                c:"#f59e0b", delay:1.0 },
                ].map((l,i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:l.delay }}
                    style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}>
                    <span style={{ color:"rgba(255,255,255,0.25)", fontSize:10 }}>{String(i+1).padStart(2,"0")}</span>
                    <span style={{ color:"rgba(245,158,11,0.6)" }}>{l.key}</span>
                    <span style={{ color:"rgba(255,255,255,0.2)" }}>:</span>
                    <span style={{ color:l.c }}>{l.val}</span>
                  </motion.div>
                ))}
                {/* Progress bar */}
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.1 }}
                  style={{ marginTop:20, padding:"12px 0", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, letterSpacing:"0.1em", color:"var(--dim)", marginBottom:8 }}>
                    <span>COMPLETION PROGRESS</span><span style={{ color:"#f59e0b" }}>42%</span>
                  </div>
                  <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:1, overflow:"hidden" }}>
                    <motion.div initial={{ width:0 }} animate={{ width:"42%" }} transition={{ delay:1.3, duration:0.8 }}
                      style={{ height:"100%", background:"linear-gradient(90deg,#f59e0b,#fbbf24)", borderRadius:1 }} />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8, opacity:0.3, animation:"floatY 2s ease-in-out infinite" }}>
        <span style={{ fontFamily:"var(--mono)", fontSize:8, letterSpacing:"0.2em" }}>SCROLL</span>
        <div style={{ width:1, height:32, background:"linear-gradient(to bottom,rgba(245,158,11,0.6),transparent)" }} />
      </div>
    </section>
  );
}

/* ── FEATURES ── */
const FEATURES = [
  { icon:"01", title:"AI ROADMAP GENERATOR", desc:"Describe your goal. Get a fully structured learning plan with phases, milestones, and timelines — generated in under 30 seconds.", tag:"CORE" },
  { icon:"02", title:"PREREQUISITE MAPPING", desc:"Every topic links its dependencies so you always know what to learn first. Never hit a wall again.", tag:"CORE" },
  { icon:"03", title:"REAL PROJECT ENGINE", desc:"Each phase unlocks curated projects that reinforce your new skills. Learn by building actual things.", tag:"PREMIUM" },
  { icon:"04", title:"WEEKLY SCHEDULER", desc:"Your roadmap auto-schedules into bite-sized weekly goals based on your available hours per day.", tag:"CORE" },
  { icon:"05", title:"INTERVIEW PREP SUITE", desc:"Role-specific question banks, system design primers, and coding patterns — tailored to your target level.", tag:"PREMIUM" },
  { icon:"06", title:"PROGRESS TRACKING", desc:"Visual checkpoints and phase completion rings keep you accountable and on pace with your goals.", tag:"CORE" },
];

function Features() {
  return (
    <section id="features" style={{ padding:"120px 40px", position:"relative" }}>
      <style>{`
        .feat-item {
          padding:28px; border:1px solid var(--border); background:var(--surface);
          border-radius:2px; cursor:default; position:relative; overflow:hidden;
          transition:border-color 0.2s, transform 0.25s, background 0.2s;
        }
        .feat-item::after {
          content:''; position:absolute; inset:0; opacity:0; transition:opacity 0.3s;
          background:linear-gradient(135deg,rgba(245,158,11,0.04),transparent);
        }
        .feat-item:hover { border-color:rgba(245,158,11,0.35); transform:translateY(-3px); }
        .feat-item:hover::after { opacity:1; }
        .feat-item:hover .feat-num { color:#f59e0b; }
      `}</style>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ marginBottom:64 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
            <div style={{ width:32, height:1, background:"#f59e0b" }} />
            <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.18em", color:"#f59e0b" }}>SYSTEM MODULES</span>
          </div>
          <h2 style={{ fontFamily:"var(--display)", fontSize:"clamp(40px,5vw,72px)", lineHeight:0.9, letterSpacing:"0.02em", textTransform:"uppercase" }}>
            EVERYTHING<br />
            <span style={{ WebkitTextFillColor:"transparent", WebkitTextStroke:"1.5px rgba(232,232,232,0.3)" }}>YOU NEED</span>
          </h2>
        </motion.div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:2 }}>
          {FEATURES.map((f,i) => (
            <motion.div key={i} className="feat-item"
              initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.07 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                <span className="feat-num" style={{ fontFamily:"var(--display)", fontSize:40, color:"rgba(255,255,255,0.08)", transition:"color 0.2s" }}>{f.icon}</span>
                <span style={{ fontFamily:"var(--mono)", fontSize:8, letterSpacing:"0.16em", padding:"3px 8px", border:`1px solid ${f.tag==="PREMIUM"?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.12)"}`, color:f.tag==="PREMIUM"?"#f59e0b":"var(--dim)", borderRadius:2 }}>{f.tag}</span>
              </div>
              <h3 style={{ fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.1em", color:"var(--text)", marginBottom:12, fontWeight:600 }}>{f.title}</h3>
              <p style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--muted)", lineHeight:1.7 }}>{f.desc}</p>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.2),transparent)" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ── */
const STEPS = [
  { n:"01", title:"DEFINE GOAL", desc:"Enter target role and experience level. The more specific, the more precision your roadmap delivers.", items:["Target role", "Experience level", "Daily availability"] },
  { n:"02", title:"AI BUILDS PLAN", desc:"Our model analyzes thousands of career trajectories to build a phase-by-phase roadmap unique to you.", items:["Phase structure", "Topic ordering", "Time estimates"] },
  { n:"03", title:"EXECUTE & SHIP", desc:"Follow your interactive plan, check off topics, unlock projects, and become job-ready fast.", items:["Track progress", "Build projects", "Prep interviews"] },
];

function HowItWorks() {
  return (
    <section id="how" style={{ padding:"120px 40px", background:"#060606", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, opacity:0.02, backgroundImage:"radial-gradient(rgba(245,158,11,1) 1px, transparent 1px)", backgroundSize:"40px 40px" }} />
      <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:1 }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ marginBottom:80 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
            <div style={{ width:32, height:1, background:"#f59e0b" }} />
            <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.18em", color:"#f59e0b" }}>PROCESS</span>
          </div>
          <h2 style={{ fontFamily:"var(--display)", fontSize:"clamp(40px,5vw,72px)", lineHeight:0.9, textTransform:"uppercase" }}>
            FROM ZERO<br />
            <span style={{ WebkitTextFillColor:"transparent", WebkitTextStroke:"1.5px rgba(232,232,232,0.3)" }}>TO ROADMAP</span>
          </h2>
        </motion.div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:0, position:"relative" }}>
          {/* Connector line */}
          <div style={{ position:"absolute", top:48, left:"16%", right:"16%", height:1, background:"linear-gradient(90deg,rgba(245,158,11,0.3),rgba(245,158,11,0.6),rgba(245,158,11,0.3))", zIndex:0 }} />

          {STEPS.map((s,i) => (
            <motion.div key={i} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.15 }}
              style={{ padding:"0 32px", position:"relative", zIndex:1, borderLeft: i>0 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
              {/* Step number node */}
              <div style={{ width:48, height:48, background:"#f59e0b", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:32, position:"relative" }}>
                <span style={{ fontFamily:"var(--display)", fontSize:20, color:"#080808" }}>{s.n}</span>
                <div style={{ position:"absolute", inset:-6, border:"1px solid rgba(245,158,11,0.2)" }} />
              </div>
              <h3 style={{ fontFamily:"var(--mono)", fontSize:13, letterSpacing:"0.1em", fontWeight:700, marginBottom:16, color:"var(--text)" }}>{s.title}</h3>
              <p style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--muted)", lineHeight:1.7, marginBottom:24 }}>{s.desc}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {s.items.map((item,j) => (
                  <div key={j} style={{ display:"flex", alignItems:"center", gap:10, fontFamily:"var(--mono)", fontSize:11, color:"var(--dim)" }}>
                    <div style={{ width:4, height:4, background:"#f59e0b", borderRadius:"50%", flexShrink:0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTA() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  return (
    <section id="cta" style={{ padding:"120px 40px", position:"relative", overflow:"hidden" }}>
      {/* Amber burst */}
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,0.06),transparent 70%)", pointerEvents:"none" }} />

      <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ border:"1px solid rgba(245,158,11,0.2)", borderRadius:4, padding:"80px 60px", background:"rgba(14,14,14,0.8)", backdropFilter:"blur(20px)", position:"relative", overflow:"hidden" }}>
          {/* Corner accents */}
          {[[0,0],[1,0],[0,1],[1,1]].map(([x,y],i) => (
            <div key={i} style={{
              position:"absolute", width:20, height:20,
              [y===0?"top":"bottom"]:0, [x===0?"left":"right"]:0,
              borderTop:y===0?"1px solid rgba(245,158,11,0.5)":undefined,
              borderBottom:y===1?"1px solid rgba(245,158,11,0.5)":undefined,
              borderLeft:x===0?"1px solid rgba(245,158,11,0.5)":undefined,
              borderRight:x===1?"1px solid rgba(245,158,11,0.5)":undefined,
            }} />
          ))}

          <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.2em", color:"#f59e0b", marginBottom:24 }}>
            ▸ START FOR FREE — NO SIGNUP REQUIRED
          </div>

          <h2 style={{ fontFamily:"var(--display)", fontSize:"clamp(48px,7vw,96px)", lineHeight:0.88, letterSpacing:"0.02em", textTransform:"uppercase", marginBottom:24 }}>
            YOUR CAREER<br />PATH STARTS<br />
            <span style={{ WebkitTextFillColor:"transparent", WebkitTextStroke:"1.5px rgba(245,158,11,0.7)" }}>RIGHT NOW</span>
          </h2>

          <p style={{ fontFamily:"var(--mono)", fontSize:13, color:"var(--muted)", lineHeight:1.8, maxWidth:480, margin:"0 auto 48px" }}>
            Join thousands of engineers who used CareerAI to navigate their next career move with precision.
          </p>

          <button
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            onClick={() => navigate("/generate")}
            style={{
              padding:"16px 48px", background:hover?"#fbbf24":"#f59e0b", color:"#080808",
              fontFamily:"var(--mono)", fontSize:12, fontWeight:700, letterSpacing:"0.16em",
              border:"none", cursor:"pointer", borderRadius:2,
              transform:hover?"translateY(-3px)":"translateY(0)",
              boxShadow:hover?"0 20px 60px rgba(245,158,11,0.4)":"0 8px 30px rgba(245,158,11,0.2)",
              transition:"all 0.25s",
            }}>
            GENERATE MY ROADMAP →
          </button>

          <div style={{ marginTop:24, fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.1em", color:"var(--dim)" }}>
            FREE TO GENERATE · 30s SETUP · NO CREDIT CARD
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"40px", position:"relative" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:22, height:22, background:"#f59e0b", clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
          <span style={{ fontFamily:"var(--display)", fontSize:18, letterSpacing:"0.06em" }}>CAREERAI</span>
        </div>
        <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.1em", color:"var(--dim)" }}>© 2026 CAREERAI. ALL RIGHTS RESERVED.</span>
        <div style={{ display:"flex", gap:24 }}>
          {["PRIVACY","TERMS","CONTACT"].map(l => (
            <a key={l} href="#" style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.1em", color:"var(--dim)", textDecoration:"none", transition:"color 0.2s" }}
              onMouseEnter={e => e.target.style.color="#f59e0b"} onMouseLeave={e => e.target.style.color="var(--dim)"}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ── MAIN LANDING ── */
export default function Landing() {
  return (
    <>
      <style>{GLOBAL}</style>
      <Scanlines />
      <GridBg />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  );
}