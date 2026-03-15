// src/pages/settings.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axios from "../api/axios";

// ─── Theme definitions (mirrors ThemeContext.THEMES) ────────────────────────
// We pull them straight from the context so there's a single source of truth.

// ─── Small reusable section wrapper ─────────────────────────────────────────
function Section({ label, index, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 2 }}
    >
      <div style={{
        border: "1px solid var(--border)",
        borderRadius: 4,
        overflow: "hidden",
        background: "var(--bg-surface)",
        transition: "border-color 0.3s",
      }}>
        {/* Section header stripe */}
        <div style={{
          padding: "14px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-raised)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{ width: 2, height: 16, background: "var(--accent)", borderRadius: 1 }} />
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "var(--accent)",
            textTransform: "uppercase",
          }}>
            {label}
          </span>
        </div>
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Toast notification ──────────────────────────────────────────────────────
function Toast({ message, type, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            padding: "12px 24px",
            background: type === "error" ? "var(--danger-bg)" : "rgba(34,197,94,0.12)",
            border: `1px solid ${type === "error" ? "var(--danger-border)" : "var(--success-border)"}`,
            borderRadius: 4,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: type === "error" ? "var(--danger)" : "var(--success)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          {type === "error" ? "✕" : "✓"} {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Theme card ──────────────────────────────────────────────────────────────
function ThemeCard({ theme, isActive, onSelect, isSaving }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={() => !isSaving && onSelect(theme.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      style={{
        background: theme.bg,
        border: `1px solid ${isActive ? theme.accent : "rgba(255,255,255,0.06)"}`,
        borderRadius: 4,
        padding: 0,
        cursor: isSaving ? "not-allowed" : "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.25s, transform 0.2s",
        boxShadow: isActive
          ? `0 0 0 1px ${theme.accent}, 0 8px 32px ${theme.accent}22`
          : hovered
          ? `0 8px 24px rgba(0,0,0,0.4)`
          : "none",
        transform: hovered && !isActive ? "translateY(-2px)" : "translateY(0)",
        opacity: isSaving ? 0.7 : 1,
      }}
    >
      {/* Mini UI preview */}
      <div style={{ padding: "14px 14px 10px" }}>
        {/* Fake navbar */}
        <div style={{
          height: 6,
          borderRadius: 1,
          background: `${theme.accent}22`,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 3,
          padding: "0 4px",
        }}>
          {[1,0.6,0.3].map((o,i) => (
            <div key={i} style={{ width: 12, height: 3, borderRadius: 1, background: theme.accent, opacity: o }} />
          ))}
        </div>
        {/* Fake content lines */}
        {[0.7, 0.4, 0.55, 0.3].map((o, i) => (
          <div key={i} style={{
            height: 4,
            borderRadius: 1,
            background: theme.accent,
            opacity: o * 0.35,
            marginBottom: 5,
            width: i === 1 ? "60%" : i === 3 ? "75%" : "100%",
          }} />
        ))}
        {/* Fake button */}
        <div style={{
          height: 14,
          borderRadius: 2,
          background: theme.accent,
          opacity: 0.9,
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{ width: 24, height: 3, borderRadius: 1, background: theme.bg, opacity: 0.7 }} />
        </div>
      </div>

      {/* Label row */}
      <div style={{
        padding: "8px 14px 10px",
        borderTop: `1px solid ${theme.accent}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.08em",
          color: theme.accent,
          fontWeight: 600,
        }}>
          {theme.label.toUpperCase()}
        </span>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3.5 6L6.5 2" stroke={theme.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </div>

      {/* Active glow bar */}
      {isActive && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
        }} />
      )}
    </motion.button>
  );
}

// ─── Main Settings Page ──────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { theme: activeTheme, saveTheme, THEMES } = useTheme();

  // Profile form
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState({ current: false, next: false, confirm: false });

  // Theme saving
  const [themeSaving, setThemeSaving] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const toastTimer = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleThemeSelect = async (id) => {
    setThemeSaving(true);
    try {
      await saveTheme(id); // optimistic + DB save
      showToast(`Theme switched to ${THEMES.find(t => t.id === id)?.label}`);
    } catch {
      showToast("Failed to save theme", "error");
    } finally {
      setThemeSaving(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return showToast("Name cannot be empty", "error");
    setProfileLoading(true);
    try {
      const { data } = await axios.put("/api/auth/me", {
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      setUser(prev => ({ ...prev, ...data }));
      showToast("Profile updated");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.next.length < 8) return showToast("Password must be at least 8 characters", "error");
    if (pwForm.next !== pwForm.confirm) return showToast("Passwords do not match", "error");
    setPwLoading(true);
    try {
      await axios.put("/api/auth/password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwForm({ current: "", next: "", confirm: "" });
      showToast("Password changed successfully");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to change password", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return showToast('Type "DELETE" to confirm', "error");
    setDeleteLoading(true);
    try {
      await axios.delete("/api/auth/me");
      logout();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete account", "error");
      setDeleteLoading(false);
    }
  };

  const pwStrength = (pw) => pw.length < 6 ? 25 : pw.length < 10 ? 60 : 100;
  const pwColor    = (pw) => pw.length < 6 ? "var(--danger)" : pw.length < 10 ? "var(--accent)" : "var(--success)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0; } }
        .st-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'IBM Plex Mono', monospace;
          padding: calc(var(--navbar-height, 56px) + 48px) 40px 120px;
          color: var(--text);
          transition: background 0.4s ease, color 0.3s ease;
          position: relative;
        }
        .st-grid {
          position: fixed; inset: 0;
          opacity: var(--grid-opacity, 0.025);
          pointer-events: none;
          background-image:
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .st-input {
          width: 100%; padding: 11px 14px;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 2px; color: var(--text);
          font-family: 'IBM Plex Mono', monospace; font-size: 13px; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .st-input:focus {
          border-color: var(--border-focus);
          background: var(--input-focus-bg);
          box-shadow: var(--input-focus-shadow);
        }
        .st-input::placeholder { color: var(--text-faint); }
        .st-label {
          display: block; font-size: 9px; letter-spacing: 0.18em;
          color: var(--text-dim); margin-bottom: 8px; text-transform: uppercase;
        }
        .st-btn {
          padding: 11px 28px;
          background: var(--accent); color: var(--bg);
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; border: none; cursor: pointer; border-radius: 2px;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .st-btn:hover:not(:disabled) { background: var(--accent-bright); transform: translateY(-1px); box-shadow: 0 6px 20px var(--accent-glow); }
        .st-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .st-btn-ghost {
          padding: 11px 28px;
          background: transparent; color: var(--text-muted);
          font-family: 'IBM Plex Mono', monospace; font-size: 10px;
          letter-spacing: 0.14em; border: 1px solid var(--border); cursor: pointer; border-radius: 2px;
          transition: all 0.2s;
        }
        .st-btn-ghost:hover { border-color: var(--accent-border); color: var(--accent); }
        .st-btn-danger {
          padding: 11px 28px;
          background: var(--danger-bg); color: var(--danger);
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; border: 1px solid var(--danger-border); cursor: pointer; border-radius: 2px;
          transition: all 0.2s;
        }
        .st-btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.18); box-shadow: 0 4px 16px rgba(239,68,68,0.2); }
        .st-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
        .st-spin { width: 12px; height: 12px; border: 1.5px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin .7s linear infinite; opacity: 0.6; }
        .st-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--text-dim);
          padding: 4px; display: flex; align-items: center; transition: color 0.15s;
        }
        .st-pw-toggle:hover { color: var(--text-muted); }
        .st-divider { height: 1px; background: var(--border); margin: 20px 0; }
        .st-field { margin-bottom: 18px; }
        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
        }
      `}</style>

      <div className="st-root">
        <div className="st-grid" />

        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 48 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "blink 2s infinite", boxShadow: "0 0 8px var(--accent)" }} />
              <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--accent)" }}>ACCOUNT SETTINGS</span>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px,5vw,64px)", letterSpacing: "0.02em", lineHeight: 0.9, textTransform: "uppercase", color: "var(--text-heading)" }}>
              PREFERENCES<br />
              <span style={{ WebkitTextFillColor: "transparent", WebkitTextStroke: "1.5px var(--text-dim)" }}>& PROFILE</span>
            </h1>

            {/* User meta */}
            {user && (
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", border: "1px solid var(--border)", borderRadius: 4, background: "var(--bg-surface)" }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "var(--accent)",
                  flexShrink: 0,
                }}>
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--text-heading)", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.email}
                  </div>
                </div>
                <button className="st-btn-ghost" style={{ fontSize: 9, padding: "6px 14px", whiteSpace: "nowrap" }} onClick={logout}>
                  SIGN OUT
                </button>
              </div>
            )}
          </motion.div>

          {/* ── 01 — APPEARANCE ── */}
          <Section label="01 · Appearance" index={0}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
                Choose a color theme. Changes apply instantly and are saved to your account.
              </div>

              <div className="theme-grid">
                {THEMES.map(t => (
                  <ThemeCard
                    key={t.id}
                    theme={t}
                    isActive={activeTheme === t.id}
                    onSelect={handleThemeSelect}
                    isSaving={themeSaving}
                  />
                ))}
              </div>

              {themeSaving && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em" }}>
                  <div className="st-spin" />
                  SAVING THEME...
                </div>
              )}
            </div>
          </Section>

          {/* ── 02 — PROFILE ── */}
          <Section label="02 · Profile" index={1}>
            <form onSubmit={handleProfileSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 0 }}>
                <div className="st-field">
                  <label className="st-label">Display Name</label>
                  <input
                    className="st-input"
                    type="text"
                    placeholder="Your name"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="st-field">
                  <label className="st-label">Email Address</label>
                  <input
                    className="st-input"
                    type="email"
                    placeholder="you@example.com"
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  className="st-btn-ghost"
                  onClick={() => setProfile({ name: user?.name || "", email: user?.email || "" })}
                >
                  RESET
                </button>
                <button type="submit" className="st-btn" disabled={profileLoading}>
                  {profileLoading ? <><span className="st-spin" /> SAVING...</> : "SAVE PROFILE"}
                </button>
              </div>
            </form>
          </Section>

          {/* ── 03 — PASSWORD ── */}
          <Section label="03 · Password" index={2}>
            <form onSubmit={handlePasswordChange}>
              {[
                { key: "current", label: "Current Password",  placeholder: "Your current password" },
                { key: "next",    label: "New Password",      placeholder: "Min. 8 characters" },
                { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
              ].map(f => (
                <div key={f.key} className="st-field" style={{ position: "relative" }}>
                  <label className="st-label">{f.label}</label>
                  <input
                    className="st-input"
                    type={pwVisible[f.key] ? "text" : "password"}
                    placeholder={f.placeholder}
                    value={pwForm[f.key]}
                    onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="st-pw-toggle"
                    onClick={() => setPwVisible(v => ({ ...v, [f.key]: !v[f.key] }))}
                    tabIndex={-1}
                  >
                    {pwVisible[f.key]
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                  {f.key === "next" && pwForm.next && (
                    <div style={{ marginTop: 5, height: 2, background: "var(--border)", borderRadius: 1, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 1, background: pwColor(pwForm.next), width: `${pwStrength(pwForm.next)}%`, transition: "width 0.3s, background 0.3s" }} />
                    </div>
                  )}
                  {f.key === "confirm" && pwForm.confirm && pwForm.next && (
                    <div style={{ marginTop: 5, fontSize: 9, letterSpacing: "0.1em", color: pwForm.confirm === pwForm.next ? "var(--success)" : "var(--danger)" }}>
                      {pwForm.confirm === pwForm.next ? "✓ PASSWORDS MATCH" : "✕ PASSWORDS DO NOT MATCH"}
                    </div>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="st-btn" disabled={pwLoading}>
                  {pwLoading ? <><span className="st-spin" /> UPDATING...</> : "CHANGE PASSWORD"}
                </button>
              </div>
            </form>
          </Section>

          {/* ── 04 — DANGER ZONE ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.4 }}
          >
            <div style={{
              border: "1px solid var(--danger-border)",
              borderRadius: 4,
              overflow: "hidden",
              background: "var(--bg-surface)",
            }}>
              <div style={{
                padding: "14px 24px",
                borderBottom: "1px solid var(--danger-border)",
                background: "var(--danger-bg)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{ width: 2, height: 16, background: "var(--danger)", borderRadius: 1 }} />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: "0.2em", color: "var(--danger)", textTransform: "uppercase" }}>
                  04 · Danger Zone
                </span>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
                  Permanently delete your account and all associated roadmaps. <span style={{ color: "var(--danger)" }}>This action cannot be undone.</span>
                </div>
                <div className="st-field">
                  <label className="st-label" style={{ color: "rgba(239,68,68,0.5)" }}>
                    Type <span style={{ color: "var(--danger)", fontWeight: 700 }}>DELETE</span> to confirm
                  </label>
                  <input
                    className="st-input"
                    type="text"
                    placeholder="DELETE"
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    style={{ borderColor: deleteConfirm === "DELETE" ? "var(--danger-border)" : undefined }}
                  />
                </div>
                <button
                  type="button"
                  className="st-btn-danger"
                  disabled={deleteConfirm !== "DELETE" || deleteLoading}
                  onClick={handleDeleteAccount}
                >
                  {deleteLoading ? <><span className="st-spin" style={{ display: "inline-block" }} /> DELETING...</> : "DELETE ACCOUNT"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Back link ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ marginTop: 32, display: "flex", gap: 8 }}
          >
            <button className="st-btn-ghost" style={{ fontSize: 9 }} onClick={() => navigate(-1)}>← BACK</button>
            <button className="st-btn-ghost" style={{ fontSize: 9 }} onClick={() => navigate("/dashboard")}>→ DASHBOARD</button>
          </motion.div>

        </div>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </>
  );
}