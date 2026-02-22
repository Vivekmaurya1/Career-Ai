import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const CODE_LINES = [
  { indent: 0, color: "#94a3b8", text: "{" },
  { indent: 1, label: "role",     color: "#a78bfa", value: '"Full Stack Engineer"', vc: "#34d399" },
  { indent: 1, label: "level",    color: "#a78bfa", value: '"Intermediate"',        vc: "#60a5fa" },
  { indent: 1, label: "phases",   color: "#a78bfa", value: "[4 phases]",            vc: "#fbbf24" },
  { indent: 1, label: "topics",   color: "#a78bfa", value: "18 topics",             vc: "#c084fc" },
  { indent: 1, label: "projects", color: "#a78bfa", value: "6 builds",              vc: "#f87171" },
  { indent: 1, label: "duration", color: "#a78bfa", value: '"3 months"',            vc: "#34d399" },
  { indent: 0, color: "#94a3b8", text: "}" },
];

function CodeCard() {
  return (
    <motion.div
      animate={{ y: [0, -12, 0], rotateX: [0, 1, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background: "rgba(8,8,22,0.85)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: 20,
        padding: "28px 28px 24px",
        backdropFilter: "blur(30px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(109,40,217,0.1), inset 0 1px 0 rgba(255,255,255,0.07)",
        position: "relative", overflow: "hidden",
        fontFamily: "var(--mono)", fontSize: 13, lineHeight: 1.85,
      }}
    >
      {/* Top glow */}
      <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:1, background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)" }} />

      {/* Window dots */}
      <div style={{ display:"flex", gap:6, marginBottom:18 }}>
        {["#f87171","#fbbf24","#34d399"].map((c, i) => (
          <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:0.7 }} />
        ))}
        <span style={{ marginLeft:8, fontSize:10, color:"#334155", letterSpacing:"0.1em" }}>roadmap.json</span>
      </div>

      {CODE_LINES.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity:0, x:-10 }}
          animate={{ opacity:1, x:0 }}
          transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
          style={{ paddingLeft: line.indent * 18, display:"flex", gap:6, flexWrap:"wrap" }}
        >
          {line.text ? (
            <span style={{ color: line.color }}>{line.text}</span>
          ) : (
            <>
              <span style={{ color: line.color }}>{line.label}:</span>
              <span style={{ color: line.vc }}>{line.value}</span>
              {i < CODE_LINES.length - 1 && <span style={{ color:"#334155" }}>,</span>}
            </>
          )}
        </motion.div>
      ))}

      {/* Bottom fade */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(0deg,rgba(8,8,22,0.9),transparent)", pointerEvents:"none" }} />

      {/* Orbiting dot */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ position:"absolute", inset:-2, borderRadius:20, border:"1px dashed rgba(139,92,246,0.12)", pointerEvents:"none" }}
      >
        <div style={{ position:"absolute", top:-3, left:"50%", width:6, height:6, borderRadius:"50%", background:"#7c3aed", transform:"translateX(-50%)", boxShadow:"0 0 10px #7c3aed" }} />
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y       = useTransform(scrollYProgress, [0, 1],   ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const words = ["Frontend Dev", "Data Scientist", "DevOps Engineer", "ML Engineer", "Full Stack Dev"];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ── Component-scoped keyframes only ── */}
      <style>{`
        @keyframes blink        { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes floatOrb1    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.1)} }
        @keyframes floatOrb2    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes scrollBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        .hero-cta:hover  { transform: translateY(-2px); box-shadow: 0 16px 48px rgba(109,40,217,0.45) !important; }
        .hero-cta:active { transform: scale(0.97); }
        .hero-ghost:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.2) !important; }
      `}</style>

      {/* Background grid — defined in index.css */}
      <div className="page-grid" />

      <section ref={ref} style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"140px 32px 80px", overflow:"hidden" }}>

        {/* Ambient orbs */}
        <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(109,40,217,0.12),transparent 70%)", top:"-20%", left:"-15%", animation:"floatOrb1 9s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,0.1),transparent 70%)", bottom:"-10%", right:"-10%", animation:"floatOrb2 11s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(192,132,252,0.06),transparent 70%)", top:"40%", left:"45%", animation:"floatOrb1 7s 2s ease-in-out infinite", pointerEvents:"none" }} />

        <motion.div style={{ y, opacity }}>
          <div style={{ maxWidth:1160, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:64, alignItems:"center", position:"relative", zIndex:1 }}>

            {/* ── LEFT ── */}
            <div>
              {/* Eyebrow pill */}
              <motion.div
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
                style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(109,40,217,0.12)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:99, padding:"6px 14px", marginBottom:28 }}
              >
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#a78bfa", boxShadow:"0 0 8px #a78bfa", animation:"blink 2s infinite" }} />
                <span style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"#a78bfa" }}>AI-Powered • Free to Start</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
                style={{ fontSize:"clamp(40px,5vw,68px)", fontWeight:900, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:10 }}
              >
                Land your dream
                <br />
                <span style={{ position:"relative", display:"inline-block" }}>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIdx}
                      initial={{ opacity:0, y:20, filter:"blur(8px)" }}
                      animate={{ opacity:1, y:0,  filter:"blur(0px)" }}
                      exit={{    opacity:0, y:-20, filter:"blur(8px)" }}
                      transition={{ duration:0.45 }}
                      style={{ display:"inline-block", background:"linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}
                    >
                      {words[wordIdx]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <br />
                <span style={{ color:"#f1f5f9" }}>role.</span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.25 }}
                style={{ fontSize:17, color:"#64748b", lineHeight:1.7, maxWidth:440, marginBottom:40 }}
              >
                Paste your goal, get a precision-built learning path. Topics, projects, timelines — everything mapped out by AI in seconds.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.35 }}
                style={{ display:"flex", gap:12, flexWrap:"wrap" }}
              >
                <button
                  className="hero-cta"
                  onClick={() => navigate("/generate")}
                  style={{ display:"flex", alignItems:"center", gap:9, background:"linear-gradient(135deg,#6d28d9,#4f46e5)", border:"none", borderRadius:16, padding:"15px 28px", color:"white", fontFamily:"var(--font)", fontSize:16, fontWeight:700, cursor:"pointer", letterSpacing:"-0.01em", transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:"0 8px 32px rgba(109,40,217,0.35)", position:"relative", overflow:"hidden" }}
                >
                  <span style={{ position:"relative", zIndex:1 }}>Generate My Roadmap</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position:"relative", zIndex:1 }}>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(255,255,255,0.1),transparent)", borderRadius:16 }} />
                </button>

                <button
                  className="hero-ghost"
                  style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:"15px 24px", color:"#94a3b8", fontFamily:"var(--font)", fontSize:15, fontWeight:500, cursor:"pointer", transition:"all 0.25s" }}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M6 5.5l4 2-4 2V5.5Z" fill="currentColor"/>
                  </svg>
                  Watch Demo
                </button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
                style={{ marginTop:32, display:"flex", alignItems:"center", gap:12 }}
              >
                <div style={{ display:"flex" }}>
                  {["#a78bfa","#60a5fa","#34d399","#fbbf24"].map((c, i) => (
                    <div key={i} style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${c},${c}88)`, border:"2px solid #060610", marginLeft: i ? -8 : 0 }} />
                  ))}
                </div>
                <span style={{ fontSize:13, color:"#475569" }}>
                  <span style={{ color:"#f1f5f9", fontWeight:600 }}>2,400+</span> roadmaps generated this week
                </span>
              </motion.div>
            </div>

            {/* ── RIGHT — floating code card ── */}
            <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, delay:0.3 }}>
              <CodeCard />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:6, opacity:0.35, animation:"scrollBounce 2s ease-in-out infinite" }}>
          <div style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:"#475569" }}>scroll</div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>
    </>
  );
}
