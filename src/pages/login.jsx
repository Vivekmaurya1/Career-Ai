import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import ServerWakeup from "../components/ServerWakeup";
import { useAuthTheme } from "../context/ThemeContext";


export default function Login() {
  useAuthTheme("amber");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate("/generate");
    else setError(result.message || "Invalid credentials.");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');
        @keyframes authSpin { to { transform: rotate(360deg); } }
        @keyframes authFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        .authx-root {
          min-height: 100vh;
          padding: calc(var(--navbar-height, 56px) + 40px) 20px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at top left, var(--accent-dim), transparent 30%),
            radial-gradient(circle at 85% 10%, rgba(52, 211, 153, 0.12), transparent 22%),
            linear-gradient(180deg, var(--bg) 0%, var(--bg-surface) 100%);
          font-family: 'Manrope', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .authx-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: var(--grid-opacity, 0.02);
          background-image:
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(180deg, rgba(0,0,0,0.75), transparent 95%);
        }

        .authx-orb {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--accent-dim), transparent 68%);
          top: 18%;
          right: 8%;
          pointer-events: none;
          animation: authFloat 8s ease-in-out infinite;
          filter: blur(4px);
        }

        .authx-card {
          position: relative;
          z-index: 1;
          width: min(100%, 1040px);
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(320px, 0.78fr);
          border: 1px solid var(--accent-border);
          border-radius: 32px;
          overflow: hidden;
          background: rgba(8, 19, 36, 0.74);
          box-shadow: 0 28px 80px rgba(2, 8, 23, 0.34);
          backdrop-filter: blur(20px);
        }

        .authx-showcase {
          padding: 48px;
          background:
            radial-gradient(circle at top left, rgba(125, 211, 252, 0.14), transparent 30%),
            linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .authx-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid var(--accent-border);
          background: var(--accent-dim);
          color: var(--accent);
          font-size: 0.77rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .authx-badge::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-dim);
        }

        .authx-title {
          margin-top: 26px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.7rem, 5vw, 4.6rem);
          line-height: 0.95;
          letter-spacing: -0.05em;
          color: var(--text-heading);
        }

        .authx-title span {
          background: linear-gradient(135deg, var(--accent), var(--success), var(--accent-bright));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .authx-copy {
          margin-top: 20px;
          max-width: 430px;
          color: var(--text-muted);
          font-size: 1rem;
          line-height: 1.8;
        }

        .authx-points {
          margin-top: 34px;
          display: grid;
          gap: 14px;
        }

        .authx-point {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
        }

        .authx-point::before {
          content: "";
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent), var(--success));
          box-shadow: 0 0 0 5px var(--accent-dim);
          flex-shrink: 0;
        }

        .authx-panel {
          padding: 40px 34px;
        }

        .authx-headline {
          color: var(--text-heading);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          letter-spacing: -0.04em;
        }

        .authx-sub {
          margin-top: 10px;
          color: var(--text-muted);
          line-height: 1.7;
        }

        .authx-error {
          margin-top: 22px;
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid var(--danger-border);
          background: var(--danger-bg);
          color: var(--danger);
          font-size: 0.92rem;
        }

        .authx-form {
          margin-top: 24px;
          display: grid;
          gap: 18px;
        }

        .authx-label {
          display: block;
          margin-bottom: 9px;
          color: var(--text-dim);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .authx-input {
          width: 100%;
          min-height: 56px;
          padding: 0 18px;
          border-radius: 18px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text);
          font: inherit;
          outline: none;
          transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease, transform 180ms ease;
        }

        .authx-input:focus {
          border-color: var(--border-focus);
          background: var(--input-focus-bg);
          box-shadow: var(--input-focus-shadow);
        }

        .authx-input::placeholder {
          color: var(--text-faint);
        }

        .authx-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .authx-link {
          border: 0;
          background: none;
          color: var(--accent);
          cursor: pointer;
          font-size: 0.84rem;
          font-weight: 700;
        }

        .authx-submit {
          min-height: 56px;
          border: 0;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--accent), var(--success));
          color: #06111d;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .authx-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 46px var(--accent-glow);
          filter: brightness(1.03);
        }

        .authx-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .authx-spin {
          width: 15px;
          height: 15px;
          border-radius: 999px;
          border: 2px solid rgba(6, 17, 29, 0.3);
          border-top-color: #06111d;
          animation: authSpin 0.7s linear infinite;
        }

        .authx-footer {
          margin-top: 20px;
          color: var(--text-dim);
          font-size: 0.92rem;
        }

        @media (max-width: 920px) {
          .authx-card {
            grid-template-columns: 1fr;
          }

          .authx-showcase {
            border-right: 0;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
        }

        @media (max-width: 640px) {
          .authx-showcase,
          .authx-panel {
            padding: 28px 22px;
          }
        }
      `}</style>

      <ServerWakeup />

      <div className="authx-root">
        <div className="authx-grid" />
        <div className="authx-orb" />

        <motion.div
          className="authx-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="authx-showcase">
            <div className="authx-badge">Secure access</div>
            <div className="authx-title">
              Welcome <span>back</span>
            </div>
            <div className="authx-copy">
              Sign in to continue building roadmaps, track your progress, and keep your career plan moving with a cleaner, more focused workspace.
            </div>
            <div className="authx-points">
              <div className="authx-point">Personalized career roadmaps saved to your account</div>
              <div className="authx-point">Progress tracking across phases, topics, and projects</div>
              <div className="authx-point">Professional interface that stays consistent across themes</div>
            </div>
          </div>

          <div className="authx-panel">
            <div className="authx-headline">Sign in</div>
            <div className="authx-sub">Use your account details to continue where you left off.</div>

            {error && <div className="authx-error">{error}</div>}

            <form className="authx-form" onSubmit={handleSubmit}>
              <div>
                <label className="authx-label">Email</label>
                <input
                  className="authx-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>

              <div>
                <div className="authx-row">
                  <label className="authx-label" style={{ marginBottom: 9 }}>Password</label>
                  <button type="button" className="authx-link">
                    Forgot?
                  </button>
                </div>
                <input
                  className="authx-input"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                />
              </div>

              <button className="authx-submit" type="submit" disabled={loading}>
                {loading ? <><span className="authx-spin" /> Signing in...</> : "Sign in to CareerAI"}
              </button>
            </form>

            <div className="authx-footer">
              Need an account?{" "}
              <button type="button" className="authx-link" onClick={() => navigate("/register")}>
                Create one
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
