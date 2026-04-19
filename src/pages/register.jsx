import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthTheme } from "../context/ThemeContext";

export function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  useAuthTheme("amber");

  const [form,     setForm]     = useState({ name: "", email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const pwStrength = form.password.length < 6 ? 26 : form.password.length < 10 ? 62 : 100;
  const pwColor    = form.password.length < 6 ? "var(--error)" : form.password.length < 10 ? "var(--warn)" : "var(--success)";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      const loginResult = await login(form.email, form.password);
      setLoading(false);
      if (loginResult.success) {
        navigate("/dashboard");
        return;
      }
      setError(loginResult.message);
    } else {
      setLoading(false);
      setError(result.message);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-root {
          min-height: 100vh;
          padding: var(--navbar-h) 0 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg);
          font-family: var(--font-sans);
          overflow: hidden;
        }

        /* LEFT */
        .auth-left {
          position: relative;
          background: var(--bg-1);
          border-right: 1px solid var(--brd);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(40px, 5vw, 72px);
          min-height: calc(100vh - var(--navbar-h));
          overflow: hidden;
        }

        .auth-left-dots {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        .auth-left-vline {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, transparent 0%, var(--a) 25%, var(--a-glow) 70%, transparent 100%);
        }

        .auth-left-glow {
          position: absolute;
          top: -100px; left: -100px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--a-glow) 0%, transparent 70%);
          pointer-events: none;
          filter: blur(40px);
        }

        .auth-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--a);
          border: 1px solid var(--a-brd);
          background: var(--a-dim);
          padding: 6px 13px;
          border-radius: var(--r-sm);
          margin-bottom: 32px;
        }

        .auth-tag-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--a);
          animation: blink 2s ease-in-out infinite;
        }

        .auth-headline {
          font-size: clamp(3rem, 4.5vw, 5rem);
          font-weight: 900;
          letter-spacing: -0.055em;
          line-height: 0.91;
          color: var(--t1);
          margin-bottom: 22px;
        }

        .auth-headline-em {
          color: var(--a);
          text-shadow: 0 0 40px var(--a-glow);
        }

        .auth-sub {
          font-size: clamp(14px, 1.2vw, 15px);
          color: var(--t2);
          line-height: 1.75;
          max-width: 340px;
          font-weight: 400;
        }

        .auth-checks {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 36px;
        }

        .auth-check {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .auth-check-icon {
          width: 20px; height: 20px;
          border-radius: 2px;
          border: 1px solid var(--a-brd);
          background: var(--a-dim);
          display: grid;
          place-items: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .auth-check-text {
          font-size: 13px;
          color: var(--t2);
          line-height: 1.65;
          font-weight: 400;
        }

        .auth-stats {
          display: flex;
          gap: 0;
          border: 1px solid var(--brd);
          border-radius: var(--r-md);
          overflow: hidden;
          margin-top: 48px;
        }

        .auth-stat {
          flex: 1;
          padding: 14px 18px;
          border-right: 1px solid var(--brd);
        }

        .auth-stat:last-child { border-right: none; }

        .auth-stat-val {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--t1);
          line-height: 1;
          margin-bottom: 4px;
        }

        .auth-stat-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--t4);
        }

        /* RIGHT */
        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(32px, 4vw, 64px) clamp(24px, 4vw, 72px);
          min-height: calc(100vh - var(--navbar-h));
          position: relative;
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 400px;
        }

        .auth-form-eyebrow {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--t4);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .auth-form-eyebrow::before {
          content: '';
          display: block;
          width: 24px; height: 1px;
          background: var(--a);
        }

        .auth-form-title {
          font-size: clamp(1.9rem, 3vw, 2.5rem);
          font-weight: 900;
          letter-spacing: -0.045em;
          color: var(--t1);
          line-height: 1;
          margin-bottom: 8px;
        }

        .auth-form-sub {
          font-size: 13px;
          color: var(--t3);
          line-height: 1.65;
          margin-bottom: 34px;
          font-weight: 400;
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          border: 1px solid var(--error-brd);
          border-left: 3px solid var(--error);
          border-radius: var(--r-md);
          background: var(--error-bg);
          color: var(--error);
          font-size: 13px;
          margin-bottom: 22px;
        }

        .auth-fields {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 26px;
        }

        .auth-field-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .auth-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--t4);
          transition: color var(--t-fast);
        }

        .auth-label.active { color: var(--a); }

        .auth-input-wrap { position: relative; }

        .auth-input {
          width: 100%;
          height: 50px;
          padding: 0 16px;
          background: var(--bg-2);
          border: 1px solid var(--brd);
          border-radius: var(--r-md);
          color: var(--t1);
          font-family: var(--font-sans);
          font-size: 14px;
          outline: none;
          transition: border-color var(--t-fast), background var(--t-fast), box-shadow var(--t-fast);
        }

        .auth-input::placeholder { color: var(--t4); }
        .auth-input:hover { border-color: var(--brd-hi); }

        .auth-input:focus {
          border-color: var(--a-brd);
          background: var(--a-dim);
          box-shadow: 0 0 0 3px var(--a-glow);
        }

        .auth-input-line {
          position: absolute;
          bottom: -1px; left: 0;
          height: 2px;
          background: var(--a);
          border-radius: 0 0 var(--r-md) var(--r-md);
          width: 0;
          transition: width 0.24s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .auth-input:focus ~ .auth-input-line {
          width: 100%;
        }

        .auth-submit {
          width: 100%;
          height: 52px;
          background: var(--a);
          color: var(--a-text);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.01em;
          border: none;
          border-radius: var(--r-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all var(--t-fast);
          margin-bottom: 18px;
        }

        .auth-submit:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 10px 28px var(--a-glow);
        }

        .auth-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .auth-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: var(--a-text);
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .auth-divider-line {
          flex: 1; height: 1px;
          background: var(--brd);
        }

        .auth-divider-text {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          color: var(--t4);
        }

        .auth-footer {
          text-align: center;
          font-size: 13px;
          color: var(--t3);
        }

        .auth-footer-link {
          background: none;
          border: none;
          color: var(--a);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-family: var(--font-sans);
          transition: opacity var(--t-fast);
        }

        .auth-footer-link:hover { opacity: 0.8; }

        .auth-security {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          margin-top: 18px;
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--t4);
          opacity: 0.6;
        }

        @media (max-width: 860px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-left { min-height: auto; padding: 40px 24px; }
          .auth-right { min-height: auto; padding: 40px 24px; }
          .auth-stats { display: none; }
        }
      `}</style>

      <div className="auth-root" style={{ gridTemplateColumns: "1fr 1fr" }}>

        {/* LEFT — form */}
        <div className="auth-right" style={{ borderRight: "1px solid var(--brd)", animation: "fadeUp 0.45s ease both" }}>
          <div className="auth-form-wrap">
            <div style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--t1)", marginBottom: 8 }}>
              Create account
            </div>
            <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 28, fontWeight: 400 }}>
              Start building your personalized career roadmap today.
            </div>

            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M7 4.5V7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="7" cy="9.5" r="0.75" fill="currentColor" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-fields">
                {[
                  { key: "name",     type: "text",     label: "Full name",      placeholder: "Your full name"    },
                  { key: "email",    type: "email",    label: "Email",           placeholder: "you@example.com"  },
                  { key: "password", type: "password", label: "Password",        placeholder: "At least 8 chars" },
                ].map(f => (
                  <div key={f.key}>
                    <div className="auth-field-header">
                      <label className="auth-label">{f.label}</label>
                    </div>
                    <div className="auth-input-wrap">
                      <input
                        className="auth-input"
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        required
                      />
                      <div className="auth-input-line" />
                    </div>
                    {f.key === "password" && form.password && (
                      <div style={{ marginTop: 6, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pwStrength}%`, background: pwColor, transition: "width 0.3s, background 0.3s", borderRadius: 2 }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading
                  ? <><span className="auth-spinner" /> Creating account…</>
                  : "Create your account"
                }
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?{" "}
              <button className="auth-footer-link" type="button" onClick={() => navigate("/login")}>
                Sign in
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — marketing */}
        <div className="auth-left" style={{ animation: "fadeUp 0.45s ease 0.08s both" }}>
          <div className="auth-left-dots" />
          <div className="auth-left-vline" />
          <div className="auth-left-glow" />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="auth-tag">
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", display: "inline-block", animation: "blink 2s ease-in-out infinite" }} />
              New workspace
            </div>

            <h2 className="auth-headline" style={{ fontSize: "clamp(2.4rem, 4vw, 4.4rem)" }}>
              Build a more<br /><span className="auth-headline-em">focused</span> career plan
            </h2>

            <p className="auth-sub" style={{ marginTop: 18 }}>
              Register once and keep everything in one place: themes, roadmap progress, upcoming milestones, and the next best step for your target role.
            </p>

            <div className="auth-checks" style={{ marginTop: 32 }}>
              {[
                "Personalised sequence for your target role",
                "Project milestones at every phase",
                "Interview prep built into the end",
              ].map(text => (
                <div key={text} className="auth-check">
                  <div className="auth-check-icon">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="var(--a)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="auth-check-text">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="auth-stats">
              {[["12k+", "Roadmaps built"], ["94%", "Interview rate"], ["≤30s", "First plan"]].map(([v, l]) => (
                <div key={l} className="auth-stat">
                  <div className="auth-stat-val">{v}</div>
                  <div className="auth-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;