/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef } from "react";
import styles from "./HowItWorks.module.css";

const STEPS = [
  {
    num: "01",
    tag: "30 seconds",
    title: "Enter your target role",
    body: "Tell us where you want to be. Frontend, ML, product design — any role, any level. No fluff, just the goal.",
  },
  {
    num: "02",
    tag: "Personalized",
    title: "AI builds your roadmap",
    body: "Our model sequences topics, timelines, and projects specifically for your goal — not a generic bootcamp curriculum.",
  },
  {
    num: "03",
    tag: "Structured",
    title: "Work through phases",
    body: "Each phase unlocks the next. Build real projects, track your progress, and stay on schedule with adaptive pacing.",
  },
  {
    num: "04",
    tag: "Get hired",
    title: "Pass the interview",
    body: "When your plan closes, interview mode opens. Mock prompts, topic drills, and confidence checkpoints — hiring-ready by design.",
  },
];

const TERMINAL_LINES = [
  { type: "cmd",    content: <>careerAI generate <span style={{ color: "var(--a)" }}>"Frontend Engineer"</span> <span style={{ color: "var(--t4)" }}>--level mid --weeks 10</span></> },
  { type: "out",    content: "✓  Analyzing role requirements..." },
  { type: "out",    content: "✓  Sequencing 4 learning phases" },
  { type: "out",    content: "✓  Generating 12 milestone projects" },
  { type: "out",    content: "✓  Building interview prep module" },
  { type: "blank",  content: "" },
  { type: "result", content: <>Roadmap ready in <span style={{ color: "var(--a)" }}>28s</span></> },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add(styles.visible);
        });
      },
      { threshold: 0.1 }
    );
    const targets = sectionRef.current?.querySelectorAll("[data-animate]");
    targets?.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="how" aria-label="How it works" ref={sectionRef}>
      <div className="container">

        <div className={styles.header} data-animate>
          <span className="signal-label">The process</span>
          <h2 className={styles.headline}>Four steps to your offer.</h2>
        </div>

        {/* Steps grid */}
        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={styles.step}
              data-animate
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className={styles.stepTop}>
                <div className={styles.stepNum}>{step.num}</div>
                {i < STEPS.length - 1 && <div className={styles.stepLine}/>}
              </div>
              <span className="tag" style={{ marginBottom: 10, display: "inline-flex" }}>{step.tag}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </div>
          ))}
        </div>

        {/* Terminal */}
        <div className={styles.terminal} data-animate>
          <div className={styles.termBar}>
            <div className={styles.termDots} aria-hidden>
              <span style={{ background: "#ff5f57" }}/>
              <span style={{ background: "#febc2e" }}/>
              <span style={{ background: "#28c840" }}/>
            </div>
            <span className="label">roadmap-generator</span>
            <div className={styles.termBadge}>
              <span className={styles.termBadgeDot}/>
              running
            </div>
          </div>
          <div className={styles.termBody}>
            {TERMINAL_LINES.map((line, i) => (
              <div
                key={i}
                className={`${styles.termLine} ${styles[`termLine_${line.type}`]}`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {line.type === "cmd" && (
                  <><span className={styles.termPrompt}>→</span><span>{line.content}</span></>
                )}
                {line.type === "out" && (
                  <span className={styles.termOut}>{line.content}</span>
                )}
                {line.type === "result" && (
                  <><span className={styles.termPrompt}>→</span>
                  <span className={styles.termResult}>{line.content}<span className={styles.cursor}/></span></>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}