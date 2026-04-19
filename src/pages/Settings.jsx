// pages/Settings.jsx
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme, THEMES } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import api from "../api/axios";

/* ── Toast ────────────────────────────────────────────────────────────────── */
function Toast({ message, type, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, padding: "11px 22px",
      background: type === "error" ? "var(--error-bg)" : "var(--success-bg)",
      border: `1px solid ${type === "error" ? "var(--error-brd)" : "var(--success-brd)"}`,
      borderRadius: "var(--r-pill)",
      fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em",
      color: type === "error" ? "var(--error)" : "var(--success)",
      backdropFilter: "blur(12px)",
      boxShadow: "var(--shadow-xl)",
      whiteSpace: "nowrap",
      animation: "fadeUp 0.2s var(--ease) both",
    }}>
      {type === "error" ? "✕" : "✓"} {message}
    </div>
  );
}

/* ── ThemeSwatch ──────────────────────────────────────────────────────────── */
function ThemeSwatch({ t, isActive, onSelect, saving }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => !saving && onSelect(t.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={saving}
      aria-label={`Switch to ${t.label} theme`}
      aria-pressed={isActive}
      style={{
        background: t.bg,
        border: `1px solid ${isActive ? t.accent : "rgba(255,255,255,0.07)"}`,
        borderRadius: "var(--r-lg)",
        padding: 0,
        cursor: saving ? "not-allowed" : "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        boxShadow: isActive
          ? `0 0 0 1px ${t.accent}, 0 6px 28px ${t.accent}44`
          : hovered ? "0 8px 28px rgba(0,0,0,0.45)" : "none",
        transform: hovered && !isActive ? "translateY(-3px)" : "none",
        opacity: saving ? 0.7 : 1,
      }}
    >
      {/* Mini UI preview */}
      <div style={{ padding: "16px 14px 10px" }}>
        {/* Fake navbar */}
        <div style={{
          height: 6, borderRadius: 2, marginBottom: 8,
          background: `${t.accent}20`, display: "flex", alignItems: "center", gap: 3, padding: "0 4px",
        }}>
          {[1, 0.55, 0.28].map((o, i) => (
            <div key={i} style={{ width: i === 0 ? 14 : 9, height: 2.5, borderRadius: 2, background: t.accent, opacity: o }} />
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ width: 18, height: 3.5, borderRadius: 999, background: t.accent, opacity: 0.75 }} />
        </div>
        {/* Fake content */}
        <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
          <div style={{ flex: 2, height: 24, borderRadius: 5, background: `${t.accent}12`, border: `1px solid ${t.accent}22` }} />
          <div style={{ flex: 1, height: 24, borderRadius: 5, background: `${t.accent}08`, border: `1px solid ${t.accent}14` }} />
        </div>
        {[0.6, 0.35, 0.5, 0.22].map((o, i) => (
          <div key={i} style={{ height: 2.5, borderRadius: 2, background: t.accent, opacity: o * 0.45, marginBottom: 4, width: i === 1 ? "60%" : i === 3 ? "75%" : "100%" }} />
        ))}
        <div style={{ height: 14, borderRadius: 999, background: t.accent, opacity: 0.85, marginTop: 8 }} />
      </div>
      {/* Label */}
      <div style={{ padding: "8px 14px 11px", borderTop: `1px solid ${t.accent}18`, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: t.accent, fontWeight: 600 }}>
            {t.label.toUpperCase()}
          </span>
          {isActive && (
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: t.accent, display: "grid", placeItems: "center" }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3.5 6L6.5 2" stroke={t.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.06em", color: `${t.accent}80`, lineHeight: 1.4 }}>
          {t.description}
        </div>
      </div>
      {isActive && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />
      )}
    </button>
  );
}

/* ── Section wrapper ─────────────────────────────────────────────────────── */
function Section({ label, step, children }) {
  return (
    <div style={{
      border: "1px solid var(--brd)",
      borderRadius: "var(--r-xl)",
      overflow: "hidden",
      background: "var(--bg-1)",
      marginBottom: 12,
    }}>
      <div style={{
        padding: "13px 22px",
        borderBottom: "1px solid var(--brd)",
        background: "rgba(255,255,255,0.015)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{ width: 2, height: 15, background: "var(--a)", borderRadius: 1, flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--a)", textTransform: "uppercase" }}>
          {step} · {label}
        </span>
      </div>
      <div style={{ padding: "22px" }}>{children}</div>
    </div>
  );
}

/* ── Field ─────────────────────────────────────────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.16em", color: "var(--t3)", textTransform: "uppercase", marginBottom: 7 }}>
          {label}
          {hint && <span style={{ color: "var(--t4)", marginLeft: 6 }}>({hint})</span>}
        </label>
      )}
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 46,
  padding: "0 14px",
  background: "var(--bg-2)",
  border: "1px solid var(--brd)",
  borderRadius: "var(--r-md)",
  color: "var(--t1)",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  outline: "none",
  transition: "border-color var(--t-fast), box-shadow var(--t-fast)",
};

/* ── Main ──────────────────────────────────────────────────────────────────── */
export default function Settings() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { theme: activeTheme, setTheme } = useTheme();

  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profileSaving, setProfileSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwVisible, setPwVisible] = useState({});

  const [themeSaving, setThemeSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3200);
  }, []);

  /* ── Theme ── */
  const handleThemeSelect = async (id) => {
    setThemeSaving(true);
    try {
      setTheme(id); // instant UI update
      await api.put("/api/auth/me", { theme: id });
      showToast(`Theme: ${THEMES.find((t) => t.id === id)?.label}`);
    } catch {
      showToast("Failed to save theme", "error");
    } finally {
      setTimeout(() => setThemeSaving(false), 300);
    }
  };

  /* ── Profile ── */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return showToast("Name cannot be empty", "error");
    setProfileSaving(true);
    try {
      const { data } = await api.put("/api/auth/me", {
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      setUser((prev) => ({ ...prev, ...data }));
      showToast("Profile saved");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save profile", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  /* ── Password ── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.next.length < 8) return showToast("Password must be ≥ 8 characters", "error");
    if (pwForm.next !== pwForm.confirm) return showToast("Passwords do not match", "error");
    setPwSaving(true);
    try {
      await api.put("/api/auth/password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwForm({ current: "", next: "", confirm: "" });
      showToast("Password updated");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setPwSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") return showToast('Type "DELETE" to confirm', "error");
    setDeleteSaving(true);
    try {
      await api.delete("/api/auth/me");
      logout();
    } catch {
      showToast("Failed to delete account", "error");
      setDeleteSaving(false);
    }
  };

  const pwStrength = pwForm.next.length < 6 ? 25 : pwForm.next.length < 10 ? 62 : 100;
  const pwColor = pwForm.next.length < 6 ? "var(--error)" : pwForm.next.length < 10 ? "var(--warn)" : "var(--success)";

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "calc(var(--navbar-h) + 48px) clamp(20px,4vw,56px) 100px", position: "relative" }}>
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, opacity: 1, pointerEvents: "none",
          backgroundImage: "linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)",
          backgroundSize: "68px 68px",
        }} />

        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--a)", display: "inline-block", animation: "pulse-dot 2s infinite", boxShadow: "0 0 8px var(--a-glow)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--a)", textTransform: "uppercase" }}>Account Settings</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(2.2rem,4vw,3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, color: "var(--t1)" }}>
              Preferences
            </h1>

            {user && (
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", border: "1px solid var(--brd)", borderRadius: "var(--r-lg)", background: "var(--bg-1)" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--a-dim)", border: "1px solid var(--a-brd)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--a)", flexShrink: 0 }}>
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", marginBottom: 2 }}>{user.name || "—"}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--t3)" }}>{user.email}</div>
                </div>
                <button
                  onClick={() => { if (window.confirm("Sign out?")) logout(); }}
                  style={{ padding: "6px 14px", border: "1px solid var(--brd)", borderRadius: "var(--r-sm)", background: "transparent", color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", cursor: "pointer", transition: "all var(--t-fast)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--error-brd)"; e.currentTarget.style.color = "var(--error)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--brd)"; e.currentTarget.style.color = "var(--t3)"; }}
                >
                  SIGN OUT
                </button>
              </div>
            )}
          </div>

          {/* ── 01 Appearance ── */}
          <Section label="Appearance" step="01">
            <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 18, lineHeight: 1.7 }}>
              Theme changes apply instantly across the entire app.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {THEMES.map((t) => (
                <ThemeSwatch
                  key={t.id}
                  t={t}
                  isActive={activeTheme === t.id}
                  onSelect={handleThemeSelect}
                  saving={themeSaving}
                />
              ))}
            </div>
            {themeSaving && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--t3)", letterSpacing: "0.12em" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px solid var(--a-brd)", borderTopColor: "var(--a)", animation: "spin 0.7s linear infinite" }} />
                Applying…
              </div>
            )}
          </Section>

          {/* ── 02 Profile ── */}
          <Section label="Profile" step="02">
            <form onSubmit={handleProfileSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Display Name">
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Your full name"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    onFocus={(e) => { e.target.style.borderColor = "var(--a-brd)"; e.target.style.boxShadow = "0 0 0 3px var(--a-dim)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--brd)"; e.target.style.boxShadow = "none"; }}
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="you@example.com"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    onFocus={(e) => { e.target.style.borderColor = "var(--a-brd)"; e.target.style.boxShadow = "0 0 0 3px var(--a-dim)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--brd)"; e.target.style.boxShadow = "none"; }}
                  />
                </Field>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setProfile({ name: user?.name || "", email: user?.email || "" })}
                  style={{ height: 36, padding: "0 14px", border: "1px solid var(--brd)", borderRadius: "var(--r-sm)", background: "transparent", color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", cursor: "pointer" }}
                >
                  RESET
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{ height: 36, padding: "0 18px", background: "var(--a)", border: "none", borderRadius: "var(--r-sm)", color: "var(--a-text)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 800, cursor: profileSaving ? "not-allowed" : "pointer", opacity: profileSaving ? 0.6 : 1, display: "flex", alignItems: "center", gap: 8 }}
                >
                  {profileSaving && <span style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(0,0,0,0.3)", borderTopColor: "var(--a-text)", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />}
                  {profileSaving ? "Saving…" : "Save Profile"}
                </button>
              </div>
            </form>
          </Section>

          {/* ── 03 Password ── */}
          <Section label="Password" step="03">
            <form onSubmit={handlePasswordChange}>
              {[
                { key: "current", label: "Current Password",    placeholder: "Your current password" },
                { key: "next",    label: "New Password",         placeholder: "Min. 8 characters" },
                { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
              ].map((f) => (
                <Field key={f.key} label={f.label}>
                  <div style={{ position: "relative" }}>
                    <input
                      type={pwVisible[f.key] ? "text" : "password"}
                      placeholder={f.placeholder}
                      value={pwForm[f.key]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      style={{ ...inputStyle, paddingRight: 40 }}
                      onFocus={(e) => { e.target.style.borderColor = "var(--a-brd)"; e.target.style.boxShadow = "0 0 0 3px var(--a-dim)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "var(--brd)"; e.target.style.boxShadow = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setPwVisible((v) => ({ ...v, [f.key]: !v[f.key] }))}
                      style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--t4)", padding: 4 }}
                    >
                      {pwVisible[f.key]
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                  {f.key === "next" && pwForm.next && (
                    <div style={{ marginTop: 5, height: 2, background: "var(--brd)", borderRadius: 1, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pwStrength}%`, background: pwColor, transition: "width 0.3s, background 0.3s", borderRadius: 1 }} />
                    </div>
                  )}
                  {f.key === "confirm" && pwForm.confirm && (
                    <div style={{ marginTop: 5, fontFamily: "var(--font-mono)", fontSize: 9, color: pwForm.confirm === pwForm.next ? "var(--success)" : "var(--error)" }}>
                      {pwForm.confirm === pwForm.next ? "✓ MATCH" : "✕ NO MATCH"}
                    </div>
                  )}
                </Field>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={pwSaving}
                  style={{ height: 36, padding: "0 18px", background: "var(--a)", border: "none", borderRadius: "var(--r-sm)", color: "var(--a-text)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 800, cursor: pwSaving ? "not-allowed" : "pointer", opacity: pwSaving ? 0.6 : 1, display: "flex", alignItems: "center", gap: 8 }}
                >
                  {pwSaving && <span style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(0,0,0,0.3)", borderTopColor: "var(--a-text)", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />}
                  {pwSaving ? "Updating…" : "Change Password"}
                </button>
              </div>
            </form>
          </Section>

          {/* ── 04 Danger Zone ── */}
          <div style={{ border: "1px solid var(--error-brd)", borderRadius: "var(--r-xl)", overflow: "hidden", background: "var(--bg-1)" }}>
            <div style={{ padding: "13px 22px", borderBottom: "1px solid var(--error-brd)", background: "var(--error-bg)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 2, height: 15, background: "var(--error)", borderRadius: 1 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--error)", textTransform: "uppercase" }}>04 · Danger Zone</span>
            </div>
            <div style={{ padding: 22 }}>
              <p style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.7, marginBottom: 16 }}>
                Permanently deletes your account and all roadmaps.
                <span style={{ color: "var(--error)" }}> This cannot be undone.</span>
              </p>
              <Field label={<>Type <strong style={{ color: "var(--error)" }}>DELETE</strong> to confirm</>}>
                <input
                  style={{ ...inputStyle, borderColor: deleteConfirm === "DELETE" ? "var(--error-brd)" : "var(--brd)" }}
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  onFocus={(e) => { e.target.style.boxShadow = deleteConfirm === "DELETE" ? "0 0 0 3px var(--error-bg)" : "none"; }}
                  onBlur={(e) => { e.target.style.boxShadow = "none"; }}
                />
              </Field>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "DELETE" || deleteSaving}
                style={{ height: 36, padding: "0 18px", background: "var(--error-bg)", border: "1px solid var(--error-brd)", borderRadius: "var(--r-sm)", color: "var(--error)", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 800, cursor: deleteConfirm !== "DELETE" || deleteSaving ? "not-allowed" : "pointer", opacity: deleteConfirm !== "DELETE" ? 0.45 : 1, display: "flex", alignItems: "center", gap: 8 }}
              >
                {deleteSaving && <span style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid var(--error-brd)", borderTopColor: "var(--error)", animation: "spin 0.7s linear infinite" }} />}
                {deleteSaving ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>

          {/* Back links */}
          <div style={{ marginTop: 28, display: "flex", gap: 8 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ height: 34, padding: "0 14px", border: "1px solid var(--brd)", borderRadius: "var(--r-sm)", background: "transparent", color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", cursor: "pointer" }}
            >
              ← BACK
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ height: 34, padding: "0 14px", border: "1px solid var(--brd)", borderRadius: "var(--r-sm)", background: "transparent", color: "var(--t3)", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", cursor: "pointer" }}
            >
              DASHBOARD →
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </>
  );
}