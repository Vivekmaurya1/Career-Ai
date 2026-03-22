import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section id="cta" className="landing-section" style={{ paddingTop: 16, paddingBottom: 30 }}>
      <div className="landing-container">
        <motion.div
          className="landing-card landing-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="landing-eyebrow">Ready to generate</div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(2.5rem, 5vw, 4.6rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
                marginTop: 22,
              }}
            >
              Build your next roadmap with a <span className="landing-heading-gradient">stronger first impression</span>
            </h2>
            <p className="landing-copy" style={{ maxWidth: 640, margin: "18px auto 0" }}>
              Turn your next role into a concrete plan with phased learning, practical projects, and interview prep that all move in the same direction.
            </p>
            <div className="landing-actions" style={{ justifyContent: "center", marginTop: 28 }}>
              <button className="landing-btn landing-btn-primary" onClick={() => navigate("/generate")}>
                Generate my roadmap
                <span aria-hidden="true">-&gt;</span>
              </button>
              <button className="landing-btn landing-btn-secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Back to top
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}