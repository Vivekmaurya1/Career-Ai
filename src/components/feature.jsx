import { useEffect, useRef } from "react";
import styles from "./Feature.module.css";

const FEATURES = [
  {
    num: "01",
    tag: "Precision planning",
    title: "Role-mapped sequencing",
    body: "State your target role and current level. The system generates a phased sequence that removes guesswork and prioritises what actually matters for hiring.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L16 5.5V12.5L9 16L2 12.5V5.5L9 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M9 2V16M2 5.5L16 12.5M16 5.5L2 12.5" stroke="currentColor" strokeWidth="1.4" opacity="0.3"/>
      </svg>
    ),
  },
  {
    num: "02",
    tag: "Portfolio-first",
    title: "Projects at every milestone",
    body: "Each phase ships a build. You gain portfolio evidence while learning the underlying concepts — so you look as good on GitHub as on paper.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6 5V4a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 9h14" stroke="currentColor" strokeWidth="1.4" opacity="0.3"/>
      </svg>
    ),
  },
  {
    num: "03",
    tag: "Hiring ready",
    title: "Interview mode, built in",
    body: "When the roadmap closes, interview prep opens. Curated mock prompts, revision loops, and confidence checkpoints — no context switching.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M9 5.5v3.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const TABLE_ROWS = [
  { feature: "Personalised sequence",   us: true,  them: false },
  { feature: "Project milestones",      us: true,  them: false },
  { feature: "Interview prep built-in", us: true,  them: false },
  { feature: "Adaptive pacing",         us: true,  them: false },
  { feature: "Progress tracking",       us: true,  them: true  },
  { feature: "Mock tests",              us: true,  them: false },
];

const Check = ({ active }) => active ? (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" fill="rgba(184,255,60,0.08)" stroke="rgba(184,255,60,0.28)" strokeWidth="1"/>
    <path d="M5 8l2 2 4-4" stroke="#b8ff3c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
) : (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M4 4l6 6M10 4L4 10" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    const targets = sectionRef.current?.querySelectorAll("[data-animate]");
    targets?.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="features" aria-label="Features" ref={sectionRef}>
      <div className="container">

        {/* Header */}
        <div className={styles.header} data-animate>
          <div className={styles.headerLeft}>
            <span className="signal-label">What sets this apart</span>
            <h2 className={styles.headline}>
              Structured planning,<br/>not another course.
            </h2>
          </div>
          <p className={styles.headerSub}>
            Most tools give you a list of topics. CareerAI gives you
            a sequenced plan with deliverables, accountability, and
            hiring-mode built into the end.
          </p>
        </div>

        {/* Feature cards */}
        <div className={styles.cards}>
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className={styles.card}
              data-animate
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>{f.icon}</div>
                <span className={styles.cardNum}>{f.num}</span>
              </div>
              <span className="tag" style={{ marginBottom: 10 }}>{f.tag}</span>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardBody}>{f.body}</p>
              <div className={styles.cardAccent}/>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <div className={styles.compare} data-animate>
          <div className={styles.compareCopy}>
            <span className="label" style={{ marginBottom: 10, display: "block" }}>How we compare</span>
            <h3 className={styles.compareTitle}>Not just another course platform.</h3>
            <p className={styles.compareBody}>
              Generic curricula leave you with knowledge but no direction.
              CareerAI maps every topic to a hiring outcome, so every hour
              you spend has a clear return.
            </p>
            <div className={styles.compareMeta}>
              {["Sequenced plan", "Project deliverables", "Interview mode"].map(m => (
                <div key={m} className={styles.compareMetaItem}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-6" stroke="#b8ff3c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {m}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Feature</span>
              <span className={styles.tableHeadUs}>CareerAI</span>
              <span>Others</span>
            </div>
            {TABLE_ROWS.map(row => (
              <div key={row.feature} className={styles.tableRow}>
                <span className={styles.tableLabel}>{row.feature}</span>
                <div className={styles.tableCell}><Check active={row.us}/></div>
                <div className={styles.tableCell}><Check active={row.them}/></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}