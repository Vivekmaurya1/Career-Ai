export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-container" style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, color: "var(--text)" }}>CareerAI</div>
          <div style={{ marginTop: 8 }}>Focused planning for serious career moves.</div>
        </div>
        <div style={{ alignSelf: "flex-end" }}>2026 CareerAI. Designed for clarity, momentum, and trust.</div>
      </div>
    </footer>
  );
}