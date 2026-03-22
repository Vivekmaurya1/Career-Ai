import { useMemo } from "react";
import { motion, useScroll } from "framer-motion";
import Hero from "../components/Hero";
import Feature from "../components/feature";
import HowItWorks from "../components/howItWorks";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');

  #root {
    overflow-x: hidden;
  }

  .landing-page {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, var(--accent-dim), transparent 28%),
      radial-gradient(circle at 85% 18%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 24%),
      radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.05), transparent 30%),
      linear-gradient(180deg, color-mix(in srgb, var(--bg) 88%, black 12%) 0%, var(--bg-surface) 36%, var(--bg) 100%);
    color: var(--text);
    font-family: 'Manrope', sans-serif;
  }

  .landing-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.32;
    background-image:
      linear-gradient(color-mix(in srgb, var(--grid-color) 28%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, var(--grid-color) 28%, transparent) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 92%);
  }

  .landing-noise {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.04;
    mix-blend-mode: soft-light;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.9) 0.7px, transparent 0.8px),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.55) 0.6px, transparent 0.7px);
    background-size: 22px 22px, 28px 28px;
  }

  .landing-container {
    position: relative;
    width: min(1180px, calc(100% - 40px));
    margin: 0 auto;
    z-index: 1;
  }

  .landing-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-overlay) 78%, transparent);
    color: var(--accent);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    backdrop-filter: blur(14px);
  }

  .landing-eyebrow::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--accent);
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 14%, transparent);
  }

  .landing-heading {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(3.2rem, 8vw, 6.4rem);
    line-height: 0.95;
    letter-spacing: -0.05em;
  }

  .landing-heading-gradient {
    background: linear-gradient(135deg, var(--accent-bright) 0%, var(--accent) 55%, color-mix(in srgb, var(--accent) 60%, #8b8b8b 40%) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .landing-copy {
    color: var(--text-muted);
    font-size: 1.05rem;
    line-height: 1.8;
  }

  .landing-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }

  .landing-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 56px;
    padding: 0 22px;
    border-radius: 18px;
    border: 1px solid transparent;
    font-size: 0.96rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
  }

  .landing-btn:hover {
    transform: translateY(-2px);
  }

  .landing-btn-primary {
    background: linear-gradient(135deg, var(--accent-bright), var(--accent));
    color: var(--bg);
    box-shadow: 0 18px 45px color-mix(in srgb, var(--accent) 18%, transparent);
  }

  .landing-btn-primary:hover {
    box-shadow: 0 24px 60px color-mix(in srgb, var(--accent) 22%, transparent);
  }

  .landing-btn-secondary {
    background: color-mix(in srgb, var(--bg-overlay) 76%, transparent);
    border-color: var(--border);
    color: var(--text);
    backdrop-filter: blur(16px);
  }

  .landing-btn-secondary:hover {
    border-color: var(--border-hover);
    background: color-mix(in srgb, var(--bg-raised) 86%, transparent);
  }

  .landing-card {
    background: color-mix(in srgb, var(--bg-overlay) 82%, transparent);
    border: 1px solid var(--border);
    border-radius: 28px;
    box-shadow: 0 24px 80px rgba(2, 8, 23, 0.35);
    backdrop-filter: blur(18px);
  }

  .landing-section {
    padding: 110px 0;
  }

  .landing-hero-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: 28px;
    align-items: center;
  }

  .landing-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .landing-metric {
    padding: 22px;
    border-radius: 24px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.03);
  }

  .landing-metric-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2rem;
    color: var(--text);
  }

  .landing-metric-label {
    margin-top: 8px;
    color: var(--text-dim);
    font-size: 0.86rem;
  }

  .landing-feature-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  .landing-feature-card {
    position: relative;
    padding: 28px;
    min-height: 280px;
    overflow: hidden;
  }

  .landing-feature-card::after {
    content: "";
    position: absolute;
    inset: auto -35% -35% auto;
    width: 180px;
    height: 180px;
    border-radius: 999px;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%);
  }

  .landing-feature-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: var(--accent-dim);
    color: var(--accent);
    font-weight: 800;
    margin-bottom: 22px;
  }

  .landing-feature-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.35rem;
    margin-bottom: 12px;
  }

  .landing-feature-copy {
    color: var(--text-muted);
    line-height: 1.75;
  }

  .landing-feature-tag {
    display: inline-flex;
    margin-top: 18px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-muted);
    font-size: 0.78rem;
    font-weight: 700;
  }

  .landing-roadmap-shell {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
    gap: 26px;
    align-items: stretch;
  }

  .landing-roadmap-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 26px;
  }

  .landing-roadmap-step {
    display: grid;
    grid-template-columns: 58px minmax(0, 1fr) auto;
    gap: 16px;
    align-items: center;
    padding: 18px;
    border-radius: 22px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.025);
  }

  .landing-roadmap-step-number {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-dim), color-mix(in srgb, var(--accent) 8%, transparent));
    color: var(--text);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
  }

  .landing-progress-card {
    padding: 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;
  }

  .landing-ring {
    position: relative;
    width: min(260px, 100%);
    aspect-ratio: 1;
    margin: 0 auto;
    border-radius: 50%;
    background:
      radial-gradient(circle at center, var(--bg) 52%, transparent 53%),
      conic-gradient(from 210deg, var(--accent) 0deg, var(--accent-bright) 210deg, rgba(255, 255, 255, 0.08) 210deg, rgba(255, 255, 255, 0.08) 360deg);
    display: grid;
    place-items: center;
  }

  .landing-ring::before {
    content: "";
    position: absolute;
    inset: 18px;
    border-radius: 50%;
    border: 1px solid var(--border);
  }

  .landing-ring-center {
    position: relative;
    text-align: center;
    z-index: 1;
  }

  .landing-ring-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 3rem;
    line-height: 1;
  }

  .landing-ring-caption {
    margin-top: 10px;
    color: var(--text-dim);
    font-size: 0.9rem;
  }

  .landing-checklist {
    display: grid;
    gap: 12px;
  }

  .landing-checklist-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-muted);
  }

  .landing-checklist-item::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--accent-bright), var(--accent));
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 12%, transparent);
    flex-shrink: 0;
  }

  .landing-cta {
    padding: 54px;
    text-align: center;
    overflow: hidden;
    position: relative;
  }

  .landing-cta::before {
    content: "";
    position: absolute;
    inset: auto auto -80px -50px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 68%);
  }

  .landing-cta::after {
    content: "";
    position: absolute;
    inset: -90px -50px auto auto;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent-bright) 14%, transparent), transparent 68%);
  }

  .landing-footer {
    padding: 34px 0 70px;
    color: var(--text-dim);
  }

  @media (max-width: 1100px) {
    .landing-feature-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .landing-roadmap-shell {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 900px) {
    .landing-metrics,
    .landing-feature-grid {
      grid-template-columns: 1fr;
    }

    .landing-section {
      padding: 82px 0;
    }

    .landing-cta {
      padding: 34px 22px;
    }
  }

  @media (max-width: 760px) {
    .landing-container {
      width: min(100% - 24px, 1180px);
    }

    .landing-hero-layout,
    .landing-roadmap-step {
      grid-template-columns: 1fr;
    }

    .landing-actions {
      flex-direction: column;
    }

    .landing-btn {
      width: 100%;
    }
  }
`;

export default function Landing() {
  const progressStyle = useMemo(
    () => ({
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: 4,
      transformOrigin: "0%",
      background: "linear-gradient(90deg, var(--accent-bright), var(--accent))",
      zIndex: 50,
      boxShadow: "0 0 30px color-mix(in srgb, var(--accent) 26%, transparent)",
    }),
    []
  );
  const { scrollYProgress } = useScroll();

  return (
    <>
      <style>{GLOBAL}</style>
      <div className="landing-page">
        <motion.div style={{ ...progressStyle, scaleX: scrollYProgress }} />
        <div className="landing-grid" />
        <div className="landing-noise" />
        <Hero />
        <Feature />
        <HowItWorks />
        <CTA />
        <Footer />
      </div>
    </>
  );
}