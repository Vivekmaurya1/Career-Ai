// src/components/footer.jsx
export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 32px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6d28d9,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font)", fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "#94a3b8" }}>CareerAI</span>
        </div>

        {/* FIXED: was #1e293b (near-black, invisible on dark bg) → now #475569 (readable) */}
        <p style={{ fontSize: 13, color: "#475569", fontFamily: "var(--mono)" }}>
          © 2026 CareerAI. All rights reserved.
        </p>

        {/* Links */}
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a
              key={l}
              href="#"
              style={{ fontSize: 13, color: "#475569", textDecoration: "none", fontFamily: "var(--font)", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#a78bfa"}
              onMouseLeave={e => e.target.style.color = "#475569"}
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom glow */}
      <div style={{ position: "absolute", bottom: 0, left: "30%", right: "30%", height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.2),transparent)" }} />
    </footer>
  );
}