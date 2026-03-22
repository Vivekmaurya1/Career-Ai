import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NAV_HEIGHT, SITE } from "../constants";

function initials(user) {
  if (!user) return "U";
  return (
    user.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user.email?.[0]?.toUpperCase() ||
    "U"
  );
}

function shortName(user) {
  return user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "User";
}

function NavLink({ label, active, accent, onClick, compact = false }) {
  return (
    <button
      type="button"
      className={`navz-link${active ? " active" : ""}${accent ? " accent" : ""}${compact ? " compact" : ""}`}
      onClick={onClick}
    >
      {accent && <span className="navz-link-dot" />}
      <span>{label}</span>
    </button>
  );
}

function ProfileMenu({ user, items, onNavigate, onLogout }) {
  const location = useLocation();

  return (
    <motion.div
      className="navz-menu"
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.18 }}
    >
      <div className="navz-menu-head">
        <div className="navz-menu-avatar">{initials(user)}</div>
        <div>
          <div className="navz-menu-title">{user?.name || shortName(user)}</div>
          <div className="navz-menu-sub">{user?.email}</div>
        </div>
      </div>

      <div className="navz-menu-grid">
        {items.map((item) => (
          <button
            key={item.path || item.label}
            type="button"
            className={`navz-menu-item${location.pathname === item.path ? " current" : ""}${item.accent ? " accent" : ""}`}
            onClick={() => onNavigate(item.path)}
          >
            <span>{item.label}</span>
            {location.pathname === item.path && <span className="navz-menu-current" />}
          </button>
        ))}
      </div>

      <div className="navz-menu-divider" />
      <button type="button" className="navz-menu-item danger" onClick={onLogout}>
        <span>Sign out</span>
      </button>
    </motion.div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isLanding = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    document.documentElement.style.setProperty("--navbar-height", `${NAV_HEIGHT}px`);
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const landingLinks = useMemo(
    () => [
      { label: "Features", action: () => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" }) },
      { label: "How It Works", action: () => document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" }) },
      { label: "Start Now", action: () => document.querySelector("#cta")?.scrollIntoView({ behavior: "smooth" }), accent: true },
    ],
    []
  );

  const appLinks = useMemo(
    () => [
      { label: "Dashboard", path: "/dashboard", action: () => navigate("/dashboard") },
      { label: "Generate", path: "/generate", action: () => navigate("/generate") },
      { label: "Mock Test", path: "/mocktest", action: () => navigate("/mocktest"), accent: true },
    ],
    [location.pathname, navigate]
  );

  const menuItems = useMemo(
    () => [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Generate", path: "/generate" },
      { label: "Mock Test", path: "/mocktest", accent: true },
      { label: "Settings", path: "/settings" },
    ],
    []
  );

  const links = isLanding || !user ? landingLinks : appLinks;

  const handleHome = () => {
    if (isLanding) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <style>{`
        .navz-shell {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 0;
          pointer-events: auto;
        }

        .navz-bar {
          pointer-events: auto;
          max-width: none;
          margin: 0;
          min-height: ${NAV_HEIGHT}px;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border-radius: 0;
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--bg-overlay) 88%, white 4%), color-mix(in srgb, var(--bg) 90%, black 8%));
          backdrop-filter: blur(18px) saturate(160%);
          box-shadow: 0 12px 28px rgba(2, 8, 23, 0.18);
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }

        .navz-bar.scrolled {
          border-bottom-color: var(--accent-border);
          box-shadow: 0 14px 32px rgba(2, 8, 23, 0.24);
        }

        .navz-logo {
          border: 0;
          background: transparent;
          color: var(--text-heading);
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 4px 6px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .navz-logo-mark {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 30% 30%, var(--accent-bright), transparent 42%),
            linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 55%, #ffffff 45%) 45%, #ffb56b 100%);
          box-shadow: 0 12px 28px color-mix(in srgb, var(--accent) 26%, transparent);
          color: #04101b;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .navz-logo:hover .navz-logo-mark {
          transform: translateY(-1px) rotate(-4deg);
          box-shadow: 0 16px 34px color-mix(in srgb, var(--accent) 30%, transparent);
        }

        .navz-logo-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1;
        }

        .navz-logo-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.03rem;
          font-weight: 700;
          letter-spacing: -0.04em;
        }

        .navz-logo-tag {
          margin-top: 4px;
          color: var(--text-dim);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .navz-center {
          flex: 1;
          display: flex;
          justify-content: center;
          min-width: 0;
        }

        .navz-links {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          min-width: 0;
        }

        .navz-link {
          min-height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 180ms ease;
          white-space: nowrap;
        }

        .navz-link:hover {
          color: var(--text-heading);
          background: rgba(255, 255, 255, 0.04);
        }

        .navz-link.active {
          color: var(--text-heading);
          border-color: var(--accent-border);
          background: linear-gradient(135deg, var(--accent-dim), rgba(255, 255, 255, 0.04));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .navz-link.accent {
          color: var(--text-heading);
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), rgba(255, 181, 107, 0.12));
          border-color: color-mix(in srgb, var(--accent) 45%, transparent);
        }

        .navz-link.compact {
          width: 100%;
          justify-content: space-between;
          min-height: 50px;
          padding: 0 14px;
          border-radius: 16px;
        }

        .navz-link-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent), #ffb56b);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent);
        }

        .navz-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .navz-auth-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .navz-ghost,
        .navz-cta,
        .navz-profile-btn,
        .navz-mobile-btn {
          min-height: 44px;
          border-radius: 16px;
          transition: all 180ms ease;
        }

        .navz-ghost {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-muted);
          padding: 0 16px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
        }

        .navz-ghost:hover {
          color: var(--text-heading);
          border-color: var(--accent-border);
        }

        .navz-cta {
          border: 1px solid color-mix(in srgb, var(--accent) 36%, transparent);
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent), rgba(255, 181, 107, 0.14));
          color: var(--text-heading);
          padding: 0 18px;
          font-size: 0.92rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 14px 34px color-mix(in srgb, var(--accent) 14%, transparent);
        }

        .navz-cta:hover {
          transform: translateY(-1px);
          filter: brightness(1.04);
        }

        .navz-profile {
          position: relative;
        }

        .navz-profile-btn {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-heading);
          padding: 4px 8px 4px 4px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .navz-profile-btn:hover,
        .navz-profile-btn.open {
          border-color: var(--accent-border);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .navz-avatar {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--accent), #ffb56b);
          color: #05101b;
          font-size: 0.82rem;
          font-weight: 800;
        }

        .navz-profile-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.05;
        }

        .navz-profile-name {
          font-size: 0.88rem;
          font-weight: 700;
        }

        .navz-profile-sub {
          margin-top: 4px;
          color: var(--text-dim);
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .navz-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 270px;
          padding: 12px;
          border-radius: 24px;
          border: 1px solid var(--accent-border);
          background: linear-gradient(180deg, color-mix(in srgb, var(--bg-overlay) 96%, white 2%), color-mix(in srgb, var(--bg) 94%, black 8%));
          box-shadow: 0 28px 70px rgba(2, 8, 23, 0.36);
          backdrop-filter: blur(20px);
          transform-origin: top right;
        }

        .navz-menu-head {
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          padding: 6px 6px 14px;
        }

        .navz-menu-avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--accent), #ffb56b);
          color: #05101b;
          font-weight: 800;
        }

        .navz-menu-title {
          color: var(--text-heading);
          font-size: 0.96rem;
          font-weight: 700;
        }

        .navz-menu-sub {
          margin-top: 4px;
          color: var(--text-dim);
          font-size: 0.78rem;
          word-break: break-word;
        }

        .navz-menu-grid {
          display: grid;
          gap: 6px;
        }

        .navz-menu-item {
          width: 100%;
          min-height: 46px;
          padding: 0 14px;
          border: 0;
          border-radius: 16px;
          background: transparent;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 700;
          transition: all 160ms ease;
        }

        .navz-menu-item:hover,
        .navz-menu-item.current {
          color: var(--text-heading);
          background: rgba(255, 255, 255, 0.04);
        }

        .navz-menu-item.accent {
          color: color-mix(in srgb, var(--accent) 70%, white 30%);
        }

        .navz-menu-item.danger {
          color: var(--danger);
        }

        .navz-menu-item.danger:hover {
          background: var(--danger-bg);
          color: #ffd2d2;
        }

        .navz-menu-divider {
          height: 1px;
          margin: 8px 0;
          background: rgba(255, 255, 255, 0.08);
        }

        .navz-menu-current {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent), #ffb56b);
        }

        .navz-mobile-btn {
          display: none;
          width: 44px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-heading);
        }

        .navz-mobile-btn:hover {
          border-color: var(--accent-border);
        }

        .navz-mobile-lines {
          width: 18px;
          height: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .navz-mobile-lines span {
          display: block;
          height: 2px;
          border-radius: 999px;
          background: currentColor;
          transition: transform 180ms ease, opacity 180ms ease;
        }

        .navz-mobile-btn.open .navz-mobile-lines span:nth-child(1) {
          transform: translateY(5px) rotate(45deg);
        }

        .navz-mobile-btn.open .navz-mobile-lines span:nth-child(2) {
          opacity: 0;
        }

        .navz-mobile-btn.open .navz-mobile-lines span:nth-child(3) {
          transform: translateY(-5px) rotate(-45deg);
        }

        .navz-mobile-panel {
          pointer-events: auto;
          max-width: none;
          margin: 0;
          padding: 14px;
          border-radius: 0 0 24px 24px;
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(180deg, color-mix(in srgb, var(--bg-overlay) 96%, white 2%), color-mix(in srgb, var(--bg) 94%, black 8%));
          box-shadow: 0 20px 42px rgba(2, 8, 23, 0.22);
          backdrop-filter: blur(20px);
        }

        .navz-mobile-group {
          display: grid;
          gap: 8px;
        }

        .navz-mobile-footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: grid;
          gap: 8px;
        }

        @media (max-width: 1140px) {
          .navz-logo-tag,
          .navz-profile-copy {
            display: none;
          }

          .navz-links {
            gap: 6px;
          }

          .navz-link {
            padding: 0 14px;
            font-size: 0.86rem;
          }
        }

        @media (max-width: 960px) {
          .navz-center,
          .navz-right {
            display: none;
          }

          .navz-mobile-btn {
            display: inline-flex;
            margin-left: auto;
          }
        }

        @media (max-width: 720px) {
          .navz-bar {
            padding: 10px 14px;
          }
        }
      `}</style>

      <div className="navz-shell">
        <div className={`navz-bar${scrolled || !isLanding ? " scrolled" : ""}`}>
          <button type="button" className="navz-logo" onClick={handleHome}>
            <div className="navz-logo-mark">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" fill="#04101b" />
              </svg>
            </div>
            <div className="navz-logo-copy">
              <span className="navz-logo-name">{SITE.name}</span>
              <span className="navz-logo-tag">Career planning platform</span>
            </div>
          </button>

          <div className="navz-center">
            <div className="navz-links">
              {links.map((link) => (
                <NavLink
                  key={link.label}
                  label={link.label}
                  active={Boolean(link.path && location.pathname === link.path)}
                  accent={Boolean(link.accent)}
                  onClick={link.action}
                />
              ))}
            </div>
          </div>

          <div className="navz-right">
            {!user ? (
              <div className="navz-auth-actions">
                {!isAuthPage && (
                  <button type="button" className="navz-ghost" onClick={() => navigate("/login")}>
                    Login
                  </button>
                )}
                <button
                  type="button"
                  className="navz-cta"
                  onClick={() => navigate(user ? "/generate" : isAuthPage ? "/register" : "/generate")}
                >
                  {user ? "Create Roadmap" : isAuthPage ? "Create account" : "Get started"}
                </button>
              </div>
            ) : (
              <div className="navz-profile" ref={profileRef}>
                <button
                  type="button"
                  className={`navz-profile-btn${profileOpen ? " open" : ""}`}
                  onClick={() => setProfileOpen((value) => !value)}
                >
                  <div className="navz-avatar">{initials(user)}</div>
                  <div className="navz-profile-copy">
                    <span className="navz-profile-name">{shortName(user)}</span>
                    <span className="navz-profile-sub">Workspace</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <ProfileMenu
                      user={user}
                      items={menuItems}
                      onNavigate={(path) => {
                        navigate(path);
                        setProfileOpen(false);
                      }}
                      onLogout={handleLogout}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <button
            type="button"
            className={`navz-mobile-btn${mobileOpen ? " open" : ""}`}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            <span className="navz-mobile-lines">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="navz-mobile-panel"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <div className="navz-mobile-group">
                {links.map((link) => (
                  <NavLink
                    key={link.label}
                    label={link.label}
                    active={Boolean(link.path && location.pathname === link.path)}
                    accent={Boolean(link.accent)}
                    compact
                    onClick={() => {
                      link.action();
                      setMobileOpen(false);
                    }}
                  />
                ))}
              </div>

              <div className="navz-mobile-footer">
                {!user ? (
                  <>
                    {!isAuthPage && (
                      <button
                        type="button"
                        className="navz-link compact"
                        onClick={() => {
                          navigate("/login");
                          setMobileOpen(false);
                        }}
                      >
                        <span>Login</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="navz-link compact accent"
                      onClick={() => {
                        navigate(isAuthPage ? "/register" : "/generate");
                        setMobileOpen(false);
                      }}
                    >
                      <span>{isAuthPage ? "Create account" : "Get started"}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="navz-link compact"
                      onClick={() => {
                        navigate("/settings");
                        setMobileOpen(false);
                      }}
                    >
                      <span>Settings</span>
                    </button>
                    <button
                      type="button"
                      className="navz-link compact"
                      onClick={handleLogout}
                    >
                      <span>Sign out</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}