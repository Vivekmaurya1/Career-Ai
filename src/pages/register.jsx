// src/pages/register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import ServerWakeup from "../components/ServerWakeup";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) navigate("/login");
    else setError(result.message);
  };

  const pwStrength = form.password.length < 6 ? 25 : form.password.length < 10 ? 60 : 100;
  const pwColor    = form.password.length < 6 ? "var(--danger)" : form.password.length < 10 ? "var(--accent)" : "var(--success)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-root {
          min-height:100vh; background: var(--bg);
          display:flex; align-items:center; justify-content:center;
          padding:calc(var(--navbar-height,56px) + 40px) 20px 40px;
          font-family:'IBM Plex Mono',monospace;
          position:relative; overflow:hidden;
          transition: background 0.4s ease, color 0.3s ease;
        }
        .auth-glow {
          position:absolute; width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle, var(--accent-dim), transparent 70%);
          top:50%; left:50%; transform:translate(-50%,-50%);
          pointer-events:none;
        }
        .auth-card {
          position:relative; z-index:2; width:100%; max-width:440px;
          background: var(--bg-surface); border:1px solid var(--accent-border);
          border-radius:4px; overflow:hidden;
          transition: background 0.4s ease, border-color 0.3s;
        }
        .auth-header { padding:28px 32px 24px; border-bottom:1px solid var(--border); background: var(--bg-raised); }
        .auth-tag { font-size:9px; letter-spacing:0.2em; color: var(--accent); margin-bottom:12px; display:flex; align-items:center; gap:8px; }
        .auth-tag-dot { width:5px; height:5px; border-radius:50%; background: var(--accent); animation:blink 2s ease infinite; box-shadow: 0 0 8px var(--accent); }
        .auth-title { font-family:'Bebas Neue',sans-serif; font-size:36px; letter-spacing:0.04em; color: var(--text-heading); line-height:1; }
        .auth-title span { color: var(--accent); }
        .auth-body { padding:32px; }
        .auth-field { margin-bottom:18px; }
        .auth-label { display:block; font-size:9px; letter-spacing:0.18em; color: var(--text-dim); margin-bottom:8px; text-transform:uppercase; }
        .auth-input {
          width:100%; padding:11px 14px;
          background: var(--input-bg); border:1px solid var(--input-border);
          border-radius:2px; color: var(--text);
          font-family:'IBM Plex Mono',monospace; font-size:13px; outline:none;
          transition:border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus {
          border-color: var(--border-focus);
          background: var(--input-focus-bg);
          box-shadow: var(--input-focus-shadow);
        }
        .auth-input::placeholder { color: var(--text-faint); }
        .auth-error {
          display:flex; align-items:center; gap:8px; padding:10px 14px;
          background: var(--danger-bg); border:1px solid var(--danger-border);
          border-radius:2px; font-size:11px; color: var(--danger); margin-bottom:20px;
        }
        .auth-btn {
          width:100%; padding:13px; background: var(--accent); color: var(--bg);
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700;
          letter-spacing:0.16em; border:none; cursor:pointer; border-radius:2px;
          transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .auth-btn:hover:not(:disabled) { background: var(--accent-bright); transform:translateY(-1px); box-shadow:0 8px 28px var(--accent-glow); }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .auth-spin { width:14px; height:14px; border:1.5px solid rgba(0,0,0,0.3); border-top-color: var(--bg); border-radius:50%; animation:spin .7s linear infinite; }
        .auth-footer { padding:20px 32px; border-top:1px solid var(--border); font-size:11px; color: var(--text-dim); text-align:center; }
        .auth-link { color: var(--accent); cursor:pointer; text-decoration:none; transition:color 0.2s; }
        .auth-link:hover { color: var(--accent-bright); }
        .password-strength { margin-top:6px; height:2px; background: var(--border); border-radius:1px; overflow:hidden; }
        .password-strength-fill { height:100%; border-radius:1px; transition:width 0.3s, background 0.3s; }
      `}</style>

      <ServerWakeup />

      <div className="auth-root">
        <div className="auth-glow" />
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", opacity:0.025, backgroundImage:"repeating-linear-gradient(0deg,rgba(255,255,255,0.5) 0px,rgba(255,255,255,0.5) 1px,transparent 1px,transparent 2px)", backgroundSize:"100% 2px" }} />

        <motion.div className="auth-card"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div style={{ height:2, background: "var(--gradient-accent)" }} />

          <div className="auth-header">
            <div className="auth-tag"><span className="auth-tag-dot" /> NEW ACCOUNT</div>
            <div className="auth-title">GET<br /><span>STARTED</span></div>
          </div>

          <div className="auth-body">
            {error && <div className="auth-error"><span>✕</span> {error}</div>}

            <form onSubmit={handleSubmit}>
              {[
                { key:"name",     label:"Full Name",      type:"text",     placeholder:"Your full name"    },
                { key:"email",    label:"Email Address",  type:"email",    placeholder:"you@example.com"   },
                { key:"password", label:"Password",       type:"password", placeholder:"Min. 8 characters" },
              ].map(f => (
                <div key={f.key} className="auth-field">
                  <label className="auth-label">{f.label}</label>
                  <input className="auth-input" type={f.type} placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})} required />
                  {f.key === "password" && form.password && (
                    <div className="password-strength">
                      <div className="password-strength-fill" style={{ width: `${pwStrength}%`, background: pwColor }} />
                    </div>
                  )}
                </div>
              ))}

              <div style={{ height:10 }} />
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <><span className="auth-spin" /> CREATING ACCOUNT...</> : "CREATE ACCOUNT →"}
              </button>
            </form>
          </div>

          <div className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">SIGN IN</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}