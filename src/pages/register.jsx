import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import ServerWakeup from "../components/ServerWakeup";
import { useAuthTheme } from "../context/ThemeContext";


export default function Register() {
  useAuthTheme("amber");
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) navigate("/login");
    else setError(result.message || "Registration failed.");
  };

  const passwordStrength = form.password.length < 6 ? 26 : form.password.length < 10 ? 62 : 100;
  const passwordColor = form.password.length < 6 ? "var(--danger)" : form.password.length < 10 ? "var(--accent)" : "var(--success)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');
        @keyframes authSpin { to { transform: rotate(360deg); } }
        @keyframes authOrbit { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(-10px, 14px, 0); } }

        .authy-root {
          min-height: 100vh;
          padding: calc(var(--navbar-height, 56px) + 40px) 20px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 15% 10%, var(--accent-dim), transparent 30%),
            radial-gradient(circle at 85% 18%, rgba(110, 231, 183, 0.14), transparent 24%),
            linear-gradient(180deg, var(--bg) 0%, var(--bg-surface) 100%);
          font-family: 'Manrope', sans-serif;
        }

        .authy-grid {
          position: absolute;
          inset: 0;
          opacity: var(--grid-opacity, 0.02);
          pointer-events: none;
          background-image:
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(180deg, rgba(0,0,0,0.72), transparent 95%);
        }

        .authy-orb {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(52, 211, 153, 0.14), transparent 70%);
          left: 10%;
          bottom: 12%;
          filter: blur(6px);
          animation: authOrbit 9s ease-in-out infinite;
          pointer-events: none;
        }

        .authy-shell {
          position: relative;
          z-index: 1;
          width: min(100%, 1080px);
          display: grid;
          grid-template-columns: minmax(320px, 0.8fr) minmax(0, 0.96fr);
          border-radius: 32px;
          overflow: hidden;
          border: 1px solid var(--accent-border);
          background: rgba(8, 19, 36, 0.76);
          box-shadow: 0 28px 80px rgba(2, 8, 23, 0.34);
          backdrop-filter: blur(20px);
        }

        .authy-panel {
          padding: 42px 36px;
        }

        .authy-side {
          padding: 46px;
          border-left: 1px solid rgba(255,255,255,0.06);
          background:
            radial-gradient(circle at top right, rgba(125, 211, 252, 0.12), transparent 26%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
        }

        .authy-chip {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(52, 211, 153, 0.24);
          background: rgba(52, 211, 153, 0.1);
          color: var(--success);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .authy-chip::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--success);
          box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
        }

        .authy-title {
          margin-top: 24px;
          color: var(--text-heading);
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.3rem, 4.6vw, 4.4rem);
          line-height: 0.96;
          letter-spacing: -0.05em;
        }

        .authy-title span {
          background: linear-gradient(135deg, var(--accent), var(--success), var(--accent-bright));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .authy-copy {
          margin-top: 18px;
          color: var(--text-muted);
          line-height: 1.8;
          max-width: 420px;
        }

        .authy-list {
          margin-top: 28px;
          display: grid;
          gap: 14px;
        }

        .authy-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
        }

        .authy-list-item::before {
          content: "";
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent), var(--success));
          box-shadow: 0 0 0 5px var(--accent-dim);
          flex-shrink: 0;
        }

        .authy-heading {
          color: var(--text-heading);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          letter-spacing: -0.04em;
        }

        .authy-sub {
          margin-top: 10px;
          color: var(--text-muted);
          line-height: 1.7;
        }

        .authy-error {
          margin-top: 22px;
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid var(--danger-border);
          background: var(--danger-bg);
          color: var(--danger);
          font-size: 0.92rem;
        }

        .authy-form {
          margin-top: 24px;
          display: grid;
          gap: 18px;
        }

        .authy-label {
          display: block;
          margin-bottom: 9px;
          color: var(--text-dim);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .authy-input {
          width: 100%;
          min-height: 56px;
          padding: 0 18px;
          border-radius: 18px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text);
          font: inherit;
          outline: none;
          transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }

        .authy-input:focus {
          border-color: var(--border-focus);
          background: var(--input-focus-bg);
          box-shadow: var(--input-focus-shadow);
        }

        .authy-input::placeholder {
          color: var(--text-faint);
        }

        .authy-strength {
          margin-top: 9px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }

        .authy-strength-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 180ms ease, background 180ms ease;
        }

        .authy-submit {
          min-height: 56px;
          border: 0;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--accent), var(--success));
          color: #06111d;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
        }

        .authy-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 46px var(--accent-glow);
          filter: brightness(1.03);
        }

        .authy-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .authy-spin {
          width: 15px;
          height: 15px;
          border-radius: 999px;
          border: 2px solid rgba(6, 17, 29, 0.3);
          border-top-color: #06111d;
          animation: authSpin 0.7s linear infinite;
        }

        .authy-footer {
          margin-top: 18px;
          color: var(--text-dim);
          font-size: 0.92rem;
        }

        .authy-link {
          color: var(--accent);
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 920px) {
          .authy-shell {
            grid-template-columns: 1fr;
          }

          .authy-side {
            border-left: 0;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
        }

        @media (max-width: 640px) {
          .authy-panel,
          .authy-side {
            padding: 28px 22px;
          }
        }
      `}</style>

      <ServerWakeup />

      <div className="authy-root">
        <div className="authy-grid" />
        <div className="authy-orb" />

        <motion.div
          className="authy-shell"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="authy-panel">
            <div className="authy-heading">Create account</div>
            <div className="authy-sub">Start with a cleaner workspace, better theme combinations, and a roadmap experience that feels much more polished.</div>

            {error && <div className="authy-error">{error}</div>}

            <form className="authy-form" onSubmit={handleSubmit}>
              <div>
                <label className="authy-label">Full name</label>
                <input
                  className="authy-input"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>

              <div>
                <label className="authy-label">Email</label>
                <input
                  className="authy-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>

              <div>
                <label className="authy-label">Password</label>
                <input
                  className="authy-input"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                />
                {form.password && (
                  <div className="authy-strength">
                    <div className="authy-strength-fill" style={{ width: `${passwordStrength}%`, background: passwordColor }} />
                  </div>
                )}
              </div>

              <button className="authy-submit" type="submit" disabled={loading}>
                {loading ? <><span className="authy-spin" /> Creating account...</> : "Create your account"}
              </button>
            </form>

            <div className="authy-footer">
              Already have an account? <Link to="/login" className="authy-link">Sign in</Link>
            </div>
          </div>

          <div className="authy-side">
            <div className="authy-chip">New workspace</div>
            <div className="authy-title">
              Build a more <span>focused</span> career plan
            </div>
            <div className="authy-copy">
              Register once and keep everything in one place: themes, roadmap progress, upcoming milestones, and the next best step for your target role.
            </div>
            <div className="authy-list">
              <div className="authy-list-item">More professional theme combinations across the app</div>
              <div className="authy-list-item">Smoother auth and navigation interactions</div>
              <div className="authy-list-item">Cleaner visual hierarchy on every screen you touch</div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
