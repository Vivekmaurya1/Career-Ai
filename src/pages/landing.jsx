import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/feature";
import HowItWorks from "../components/Howitworks";
import { CTA } from "../components/CTA";
import { Footer } from "../components/footer";
import ServerWakeup from "../components/ServerWakeup";

export default function Landing() {
  const handleGenerate = (role) => {
    const target = role
      ? `/generate?role=${encodeURIComponent(role)}`
      : "/generate";
    window.location.href = target;
  };

  return (
    <>
      {/* Wake backend on load (remove URL if not needed) */}
      <ServerWakeup url={import.meta.env.VITE_API_URL} />

      {/* Grid background */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px)
          `,
          backgroundSize: "68px 68px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.65), transparent 78%)",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.65), transparent 78%)",
        }}
      />
      <div className="noise" aria-hidden/>

      <Navbar isLanding />

      <main id="main-content">
        <Hero onGenerate={handleGenerate} />
        <Features />
        <HowItWorks />
        <CTA onGenerate={handleGenerate} />
      </main>

      <Footer />
    </>
  );
}