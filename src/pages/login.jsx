import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthTheme } from "../context/ThemeContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  useAuthTheme("amber");

  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
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

        .auth-forgot {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--t3);
          background: none;
          border: none;
          padding: 0;
          transition: color var(--t-fast);
          cursor: pointer;
        }

        .auth-forgot:hover { color: var(--a); }

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

      <div className="auth-root">

        {/* LEFT */}
        <div className="auth-left" style={{ animation: "fadeUp 0.55s ease both" }}>
          <div className="auth-left-dots" />
          <div className="auth-left-vline" />
          <div className="auth-left-glow" />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="auth-tag">
              <span className="auth-tag-dot" />
              Secure access
            </div>

            <h1 className="auth-headline">
              Welcome<br /><span className="auth-headline-em">back.</span>
            </h1>

            <p className="auth-sub">
              Sign in to continue building roadmaps, track your progress, and keep your career plan on schedule.
            </p>

            <div className="auth-checks">
              {[
                "Personalised roadmaps saved to your account",
                "Progress tracked across phases and projects",
                "Interview mode unlocks when your plan closes",
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
              {[["12k+", "Roadmaps built"], ["94%", "Interview rate"], ["9.4w", "Avg. to offer"]].map(([val, label]) => (
                <div key={label} className="auth-stat">
                  <div className="auth-stat-val">{val}</div>
                  <div className="auth-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right" style={{ animation: "fadeUp 0.55s ease 0.08s both" }}>
          <div className="auth-form-wrap">
            <div className="auth-form-eyebrow">Sign in</div>
            <div className="auth-form-title">Access your workspace</div>
            <div className="auth-form-sub">Use your account details to continue where you left off.</div>

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
                <div>
                  <div className="auth-field-header">
                    <label className={`auth-label${focused === "email" ? " active" : ""}`}>Email address</label>
                  </div>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused("")}
                      required
                    />
                    <div className="auth-input-line" />
                  </div>
                </div>

                <div>
                  <div className="auth-field-header">
                    <label className={`auth-label${focused === "password" ? " active" : ""}`}>Password</label>
                    <button type="button" className="auth-forgot">Forgot password?</button>
                  </div>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input"
                      type="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused("")}
                      required
                    />
                    <div className="auth-input-line" />
                  </div>
                </div>
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading
                  ? <><span className="auth-spinner" /> Signing in…</>
                  : <>Sign in to CareerAI <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                }
              </button>
            </form>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or</span>
              <div className="auth-divider-line" />
            </div>

            <div className="auth-footer">
              Don't have an account?{" "}
              <button className="auth-footer-link" type="button" onClick={() => navigate("/register")}>
                Create one
              </button>
            </div>

            <div className="auth-security">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1L8.5 2.5V5.5C8.5 7.2 6.9 8.7 5 9C3.1 8.7 1.5 7.2 1.5 5.5V2.5L5 1Z" stroke="currentColor" strokeWidth="0.9" />
              </svg>
              256-bit encryption · Your data is secure
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;