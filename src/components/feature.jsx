import { motion } from "framer-motion";

const features = [
  {
    number: "01",
    title: "Roadmaps that adapt to your goal",
    copy: "Tell us the role, timeline, and current skill level. The planner builds a sequence that feels realistic instead of generic.",
    tag: "Smart sequencing",
  },
  {
    number: "02",
    title: "Projects woven into every phase",
    copy: "Each milestone includes practical build ideas, so you gain portfolio proof while you learn the concepts behind it.",
    tag: "Portfolio-first",
  },
  {
    number: "03",
    title: "Interview prep without context switching",
    copy: "Move from learning mode to hiring mode with curated revision loops, mock prompts, and confidence checkpoints.",
    tag: "Career focused",
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

export default function Feature() {
  return (
    <section id="features" className="landing-section">
      <div className="landing-container">
        <SectionIntro
          eyebrow="What feels new"
          title="A roadmap planner with"
          highlight="real structure"
          copy="Each section is designed to move you from exploration to execution, with better hierarchy, clearer outcomes, and a stronger connection between learning, projects, and hiring prep."
        />

        <div className="landing-feature-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="landing-card landing-feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8 }}
            >
              <div className="landing-feature-number">{feature.number}</div>
              <div className="landing-feature-title">{feature.title}</div>
              <div className="landing-feature-copy">{feature.copy}</div>
              <div className="landing-feature-tag">{feature.tag}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}