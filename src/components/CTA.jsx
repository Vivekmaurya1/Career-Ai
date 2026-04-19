import { useState, useEffect, useRef } from "react";
import styles from "./CTA.module.css";

const QUICK_ROLES = [
  "Frontend Engineer", "Backend Engineer", "Full Stack",
  "Data Scientist", "ML Engineer", "DevOps", "iOS Developer",
];

export function CTA({ onGenerate }) {
  const [input, setInput] = useState("");
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add(styles.visible);
        });
      },
      { threshold: 0.12 }
    );
    const targets = sectionRef.current?.querySelectorAll("[data-animate]");
    targets?.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="cta" aria-label="Call to action" ref={sectionRef}>
      <div className="container">
        <div className={styles.card} data-animate>
          <div className={styles.topBar}/>
          <div className={styles.glow} aria-hidden/>

          <div className={styles.inner}>
            {/* Left */}
            <div className={styles.left}>
              <span className="signal-label" style={{ marginBottom: 16 }}>Ready to generate</span>

              <h2 className={styles.headline}>
                Build your plan.<br/>
                Land your <em>next role.</em>
              </h2>

              <p className={styles.sub}>
                CareerAI turns a role and a timeline into a concrete, week-by-week
                execution plan — with projects, milestones, and interview prep woven in.
              </p>

              <div className={styles.stats}>
                {[["12k+","Roadmaps built"],["94%","Interview rate"],["≤30s","First plan"]].map(([v,l]) => (
                  <div key={l} className={styles.stat}>
                    <div className={styles.statVal}>{v}</div>
                    <div className={styles.statLabel}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className={styles.right}>
              <label className="label" htmlFor="cta-role-input" style={{ display: "block", marginBottom: 8 }}>
                Enter your target role
              </label>

              <div className={styles.inputRow}>
                <input
                  id="cta-role-input"
                  className={styles.input}
                  placeholder="e.g. Frontend Engineer"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && onGenerate?.(input)}
                  autoComplete="off"
                />
                <button className={styles.goBtn} onClick={() => onGenerate?.(input)} aria-label="Generate roadmap">
                  Generate
                  <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <p className={styles.hint}>Takes ~30 seconds · No account required to preview</p>

              <div className={styles.divider}/>

              <div className="label" style={{ marginBottom: 8 }}>Popular roles</div>
              <div className={styles.chips}>
                {QUICK_ROLES.map(role => (
                  <button
                    key={role}
                    className={styles.chip}
                    onClick={() => { setInput(role); onGenerate?.(role); }}
                    type="button"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}