import { motion } from "framer-motion";

const roadmapSteps = [
  {
    number: "1",
    title: "Foundation sprint",
    subtitle: "Core web, tooling, and problem-solving mapped to your current level.",
    status: "Week 1-2",
  },
  {
    number: "2",
    title: "Role-specific depth",
    subtitle: "Frontend systems, API thinking, and real project milestones tailored for your target role.",
    status: "Week 3-7",
  },
  {
    number: "3",
    title: "Interview and shipping mode",
    subtitle: "Revision loops, mock rounds, and polished deliverables that make you look market-ready.",
    status: "Week 8-10",
  },
];

function SectionIntro({ eyebrow, title, highlight, copy }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55 }}
      style={{ maxWidth: 740, marginBottom: 34 }}
    >
      <div className="landing-eyebrow">{eyebrow}</div>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(2.4rem, 5vw, 4rem)",
          lineHeight: 1,
          letterSpacing: "-0.05em",
          marginTop: 22,
        }}
      >
        {title} <span className="landing-heading-gradient">{highlight}</span>
      </h2>
      <p className="landing-copy" style={{ marginTop: 18, maxWidth: 620 }}>
        {copy}
      </p>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how" className="landing-section" style={{ paddingTop: 30 }}>
      <div className="landing-container">
        <SectionIntro
          eyebrow="Execution flow"
          title="From goal to"
          highlight="weekly momentum"
          copy="The middle of the page shows how the product thinks: structured phases, visible progress, and enough detail to make the next step obvious."
        />

        <div className="landing-roadmap-shell">
          <motion.div
            className="landing-card"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            style={{ padding: 28 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "var(--text-dim)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Suggested journey
                </div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, marginTop: 8 }}>
                  Full stack to interview-ready
                </div>
              </div>
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                10 week path
              </div>
            </div>

            <div className="landing-roadmap-list">
              {roadmapSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="landing-roadmap-step"
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                >
                  <div className="landing-roadmap-step-number">{step.number}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{step.title}</div>
                    <div style={{ marginTop: 8, color: "var(--text-muted)", lineHeight: 1.7 }}>{step.subtitle}</div>
                  </div>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: "rgba(255, 255, 255, 0.04)",
                      color: "var(--text-dim)",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    {step.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="landing-card landing-progress-card"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div>
              <div style={{ color: "var(--text-dim)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Adaptive pacing
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, marginTop: 8 }}>
                Progress stays visible
              </div>
            </div>

            <div className="landing-ring">
              <div className="landing-ring-center">
                <div className="landing-ring-value">58%</div>
                <div className="landing-ring-caption">interview confidence</div>
              </div>
            </div>

            <div className="landing-checklist">
              <div className="landing-checklist-item">Real projects attached to each learning block</div>
              <div className="landing-checklist-item">Smart prerequisites to reduce overwhelm</div>
              <div className="landing-checklist-item">Interview mode once the roadmap is complete</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}