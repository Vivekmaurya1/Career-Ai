import { useState, useEffect, useRef } from "react";
import styles from "./Hero.module.css";

const ROLES = [
  "Frontend Engineer", "Backend Developer", "Data Scientist",
  "ML Engineer", "Product Designer", "DevOps Engineer",
  "iOS Developer", "Cloud Architect", "Security Engineer",
];

const STATS = [
  { value: "12k+", label: "Roadmaps",  sub: "generated" },
  { value: "94%",  label: "Interview", sub: "success rate" },
  { value: "≤30s", label: "First plan",sub: "to generate" },
  { value: "8.6w", label: "Avg. time", sub: "to offer" },
];

export default function Hero({ onGenerate }) {
  const [input,   setInput]   = useState("");
  const [roleIdx, setRoleIdx] = useState(0);
  const [roleOut, setRoleOut] = useState(false);
  const progressRef = useRef(null);
  const inputRef    = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setRoleOut(true);
      setTimeout(() => { setRoleIdx(i => (i + 1) % ROLES.length); setRoleOut(false); }, 220);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!progressRef.current) return;
    const raf = requestAnimationFrame(() => {
      if (progressRef.current) progressRef.current.style.width = "78%";
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSubmit = () => {
    if (onGenerate) onGenerate(input.trim() || ROLES[roleIdx]);
  };

  return (
    <section className={styles.section} aria-label="Hero">
      {/* Ambient glows */}
      <div className={styles.glow1} aria-hidden/>
      <div className={styles.glow2} aria-hidden/>
      <div className={styles.scanWrap} aria-hidden><div className={styles.scan}/></div>

      {/* Ticker */}
      <div className={styles.ticker} aria-hidden>
        <div className={styles.tickerInner}>
          {[...ROLES, ...ROLES, ...ROLES, ...ROLES].map((r, i) => (
            <span key={i} className={styles.tickerItem}>
              {r}<span className={styles.tickerDot}/>
            </span>
          ))}
        </div>
      </div>

      <div className={`container ${styles.body}`}>
        <div className={styles.grid}>

          {/* Left */}
          <div className={styles.left}>
            <div className={styles.eyebrow}>
              <span className="signal-label">AI Career Planning</span>
              <span className={styles.eyebrowPill}>v2.0</span>
            </div>

            <h1 className={styles.headline}>
              <span className={styles.hlLine1}>Your next role</span>
              <span className={styles.hlLine2}>starts with</span>
              <span className={styles.hlLine3}>a roadmap.</span>
            </h1>

            <p className={styles.sub}>
              Turn your career goal into a focused, week-by-week execution plan —
              with real projects, tracked milestones, and interview prep built in.
            </p>

            {/* Input */}
            <div className={styles.inputWrap}>
              <label className={styles.inputLabel} htmlFor="hero-role-input">
                <span className="label">Target role</span>
              </label>
              <div className={styles.inputRow}>
                <div className={styles.inputPrefix} aria-hidden>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <input
                  id="hero-role-input"
                  ref={inputRef}
                  className={styles.input}
                  placeholder={ROLES[roleIdx]}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  autoComplete="off"
                />
                <button className={styles.inputBtn} onClick={handleSubmit} aria-label="Build roadmap">
                  Build roadmap
                  <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <p className={styles.inputHint}>Takes ~30 seconds · No account required to preview</p>
            </div>

            {/* Chips */}
            <div className={styles.chips}>
              <span className="label" style={{ flexShrink: 0, marginRight: 4 }}>Quick pick:</span>
              {ROLES.slice(0, 5).map(role => (
                <button
                  key={role}
                  className={styles.chip}
                  onClick={() => { setInput(role); inputRef.current?.focus(); }}
                  type="button"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Right — Preview panel */}
          <div className={styles.right}>
            <div className={styles.panelHeader}>
              <div className={styles.panelDots} aria-hidden>
                <span style={{ background: "#ff5f57" }}/>
                <span style={{ background: "#febc2e" }}/>
                <span style={{ background: "#28c840" }}/>
              </div>
              <span className="label">live preview</span>
              <div className={styles.panelLive}>
                <span className={styles.liveDot}/>
                <span>active</span>
              </div>
            </div>

            {/* Card: Active roadmap */}
            <div className={styles.card} style={{ animationDelay: "0.1s" }}>
              <div className={styles.cardRow}>
                <div>
                  <div className="label" style={{ marginBottom: 3 }}>Active roadmap</div>
                  <div className={styles.cardTitle}>Frontend Engineer</div>
                </div>
                <span className="tag">Week 4/10</span>
              </div>
              <div className={styles.progressMeta}>
                <span>Core JavaScript</span>
                <span className={styles.pct}>78%</span>
              </div>
              <div className={styles.progressTrack}>
                <div ref={progressRef} className={styles.progressFill} style={{ width: 0 }}/>
              </div>
              <div className={styles.cardMilestones}>
                {["Foundations", "JS Patterns", "React", "System Design"].map((m, i) => (
                  <div key={m} className={`${styles.milestone} ${i < 2 ? styles.miDone : i === 2 ? styles.miActive : ""}`}>
                    <div className={styles.miDot}/>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Next milestone */}
            <div className={`${styles.card} ${styles.cardHighlight}`} style={{ animationDelay: "0.18s" }}>
              <div className="label" style={{ marginBottom: 6 }}>Next milestone</div>
              <div className={styles.cardTitle}>React Patterns — Project Build</div>
              <div className={styles.statusRow}>
                <span className={styles.statusDot}/>
                <span className="label">In progress · 3 days left</span>
              </div>
            </div>

            {/* Card: Interview readiness */}
            <div className={styles.card} style={{ animationDelay: "0.26s" }}>
              <div className="label" style={{ marginBottom: 8 }}>Interview readiness</div>
              <div className={styles.readyBars}>
                {[
                  { label: "Data structures", pct: 72 },
                  { label: "System design",   pct: 45 },
                  { label: "Behavioral",      pct: 60 },
                  { label: "Portfolio",        pct: 88 },
                ].map(b => (
                  <div key={b.label} className={styles.readyBar}>
                    <div className={styles.readyBarMeta}>
                      <span>{b.label}</span>
                      <span className={styles.readyPct}>{b.pct}%</span>
                    </div>
                    <div className={styles.readyTrack}>
                      <div className={styles.readyFill} style={{ width: `${b.pct}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className={styles.statsBar}>
          <div className={styles.statsAccent}/>
          {STATS.map((s, i) => (
            <div key={s.label} className={styles.stat}>
              <div className={styles.statVal}>{s.value}</div>
              <div className={styles.statMeta}>
                <span className={styles.statLabel}>{s.label}</span>
                <span className={styles.statSub}>{s.sub}</span>
              </div>
              {i < STATS.length - 1 && <div className={styles.statDiv}/>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}