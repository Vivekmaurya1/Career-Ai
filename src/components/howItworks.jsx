// src/components/HowItWorks.jsx
import { motion } from "framer-motion";

const STEPS = [
  {
    num: "01", icon: "🎯", title: "Define Your Goal",
    desc: "Enter your target role and experience level. The more specific, the more tailored your roadmap.",
    detail: ["Choose your domain", "Set experience level", "Specify time available"],
  },
  {
    num: "02", icon: "🤖", title: "AI Builds Your Plan",
    desc: "Our model analyzes thousands of career paths to construct a phase-by-phase learning roadmap just for you.",
    detail: ["Phases & milestones", "Topic ordering", "Time estimates"],
  },
  {
    num: "03", icon: "📈", title: "Learn & Ship",
    desc: "Follow your interactive plan, check off topics, and unlock real projects that prove your skills.",
    detail: ["Track daily progress", "Build real projects", "Get job-ready fast"],
  },
];

const ACCENT_COLORS = [
  { line: "rgba(139,92,246,0.5)", bg: "rgba(109,40,217,0.12)", border: "rgba(139,92,246,0.2)", dot: "#a78bfa" },
  { line: "rgba(96,165,250,0.5)",  bg: "rgba(37,99,235,0.12)",  border: "rgba(96,165,250,0.2)",  dot: "#60a5fa" },
  { line: "rgba(52,211,153,0.5)",  bg: "rgba(5,150,105,0.12)",  border: "rgba(52,211,153,0.2)",  dot: "#34d399" },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{ padding: "120px 32px", background: "rgba(0,0,0,0.25)", position: "relative", overflow: "hidden" }}>
      <style>{`
        .step-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px;
          padding: 36px 32px;
          position: relative;
          overflow: hidden;
          height: 100%;
          transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
        }
        .step-card:hover {
          border-color: rgba(139,92,246,0.25);
          background: rgba(109,40,217,0.04);
          box-shadow: 0 16px 50px rgba(0,0,0,0.4), 0 0 30px rgba(109,40,217,0.08);
        }
        .step-num {
          font-family: var(--mono);
          font-size: 11px; letter-spacing: 0.14em;
          color: #7c3aed; margin-bottom: 20px; opacity: 0.7;
        }
        .step-icon-wrap {
          width: 52px; height: 52px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 20px;
          border: 1px solid;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .step-card:hover .step-icon-wrap { transform: scale(1.1) rotate(-4deg); }
        .step-detail-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #475569; padding: 5px 0;
        }
        .step-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .step-arrow { display: none; align-items: center; justify-content: center; padding: 0 4px; }
        @media (min-width: 860px) { .step-arrow { display: flex; } }
        .steps-grid { display: grid; grid-template-columns: 1fr; gap: 20px; align-items: stretch; }
        @media (min-width: 860px) {
          .steps-grid { grid-template-columns: 1fr auto 1fr auto 1fr; gap: 0; align-items: center; }
        }
      `}</style>

      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 99, padding: "6px 14px", marginBottom: 20 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#60a5fa" }}>Simple Process</span>
          </div>
          <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.1 }}>
            From zero to roadmap<br />
            <span style={{ background: "linear-gradient(135deg,#60a5fa,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              in under 30 seconds
            </span>
          </h2>
          <p style={{ color: "#475569", fontSize: 17, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            No setup. No account required to preview. Just pure, structured direction.
          </p>
        </motion.div>

        {/* FIXED: Fragments in .map() now use key prop to avoid React warnings */}
        <div className="steps-grid">
          {STEPS.map((step, i) => {
            const c = ACCENT_COLORS[i];
            return (
              // ── FIXED: key on the wrapping element, not on React.Fragment ──
              <div key={`step-${i}`} style={{ display: "contents" }}>
                <motion.div
                  className="step-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${c.line},transparent)` }} />
                  <div className="step-num">{step.num}</div>
                  <div className="step-icon-wrap" style={{ background: c.bg, borderColor: c.border }}>{step.icon}</div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 12 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, marginBottom: 22 }}>{step.desc}</p>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 18 }}>
                    {step.detail.map((d, j) => (
                      <div key={j} className="step-detail-item">
                        <div className="step-dot" style={{ background: c.dot }} />
                        {d}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {i < STEPS.length - 1 && (
                  <div className="step-arrow">
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25, display: "block" }}>
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}