import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

const metrics = [
  { value: "12k+", label: "personalized plans generated" },
  { value: "4.9/5", label: "average learner satisfaction" },
  { value: "30 sec", label: "to ship your first roadmap" },
];

const heroStats = [
  { label: "target role", value: "Product-ready roadmap" },
  { label: "estimated duration", value: "10 weeks to confidence" },
  { label: "delivery style", value: "Projects + interview prep" },
];

function FloatingOrb({ size, top, left, right, delay, color }) {
  return (
    <motion.div
      animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
      style={{
        position: "absolute",
        top,
        left,
        right,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(8px)",
        opacity: 0.8,
        pointerEvents: "none",
      }}
    />
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const badgeScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  return (
    <section style={{ position: "relative", padding: "132px 0 84px" }}>
      <FloatingOrb size={180} top="10%" right="12%" delay={0} color="radial-gradient(circle, color-mix(in srgb, var(--accent) 38%, transparent), transparent 70%)" />
      <FloatingOrb size={220} top="38%" left="-40px" delay={1.2} color="radial-gradient(circle, color-mix(in srgb, var(--accent-bright) 18%, transparent), transparent 70%)" />
      <FloatingOrb size={170} top="62%" right="25%" delay={2.2} color="radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 70%)" />

      <div className="landing-container">
        <div className="landing-hero-layout">
          <div>
            <motion.div style={{ scale: badgeScale }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="landing-eyebrow">AI career planning system</div>
            </motion.div>

            <motion.h1
              className="landing-heading"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              style={{ maxWidth: 760, marginTop: 24 }}
            >
              A sharper path from <span className="landing-heading-gradient">learning</span> to your next role.
            </motion.h1>

            <motion.p
              className="landing-copy"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              style={{ maxWidth: 620, marginTop: 24 }}
            >
              Create a focused learning roadmap with milestones, projects, and interview preparation shaped around your target role, timeline, and current level.
            </motion.p>

            <motion.div
              className="landing-actions"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              style={{ marginTop: 30 }}
            >
              <button className="landing-btn landing-btn-primary" onClick={() => navigate("/generate")}>
                Start building now
                <span aria-hidden="true">-&gt;</span>
              </button>
              <button
                className="landing-btn landing-btn-secondary"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore the experience
              </button>
            </motion.div>

            <motion.div
              className="landing-metrics"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.34 }}
              style={{ marginTop: 34 }}
            >
              {metrics.map((item) => (
                <div key={item.label} className="landing-metric">
                  <div className="landing-metric-value">{item.value}</div>
                  <div className="landing-metric-label">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{ position: "relative" }}
          >
            <motion.div style={{ y: glowY }} className="landing-card">
              <div style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <div style={{ color: "var(--text-dim)", fontSize: 13 }}>Roadmap preview</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, marginTop: 6 }}>Frontend Engineer Track</div>
                  </div>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 16,
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    Ready in 30 sec
                  </div>
                </div>

                <div style={{ marginTop: 28, display: "grid", gap: 14 }}>
                  {heroStats.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.35 + index * 0.1 }}
                      style={{
                        padding: 18,
                        borderRadius: 22,
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ color: "var(--text-dim)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        {item.label}
                      </div>
                      <div style={{ color: "var(--text)", fontSize: 17, fontWeight: 700, marginTop: 8 }}>{item.value}</div>
                    </motion.div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 24,
                    padding: 22,
                    borderRadius: 24,
                    background: "linear-gradient(135deg, var(--accent-dim), rgba(255, 255, 255, 0.04))",
                    border: "1px solid var(--accent-border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "var(--text-dim)", fontSize: 13 }}>
                    <span>Progress alignment</span>
                    <span>78%</span>
                  </div>
                  <div style={{ marginTop: 12, height: 10, borderRadius: 999, background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(90deg, var(--accent-bright), var(--accent))",
                        boxShadow: "0 0 24px color-mix(in srgb, var(--accent) 20%, transparent)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}