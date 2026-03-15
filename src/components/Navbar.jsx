// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NAV_HEIGHT = 56;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    document.documentElement.style.setProperty(
      "--navbar-height",
      `${NAV_HEIGHT}px`,
    );

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const landingLinks = [
    {
      label: "FEATURES",
      action: () =>
        document
          .querySelector("#features")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "HOW IT WORKS",
      action: () =>
        document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "START",
      action: () =>
        document.querySelector("#cta")?.scrollIntoView({ behavior: "smooth" }),
    },
  ];

  const appLinks = [
    {
      label: "DASHBOARD",
      action: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      label: "GENERATE",
      action: () => navigate("/generate"),
      path: "/generate",
    },
    {
      label: "MOCK TEST",
      action: () => navigate("/mocktest"),
      path: "/mocktest",
      highlight: true,
    },
  ];

  const links = isLanding ? landingLinks : user ? appLinks : landingLinks;

  const pathLabel =
    {
      "/dashboard": "DASHBOARD",
      "/generate": "GENERATE",
      "/mocktest": "MOCK TEST",
      "/login": "LOGIN",
      "/register": "REGISTER",
      "/settings": "SETTINGS",
    }[location.pathname] ||
    (location.pathname.startsWith("/roadmap") ? "ROADMAP" : null);

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');

        .nb {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          height: var(--navbar-height);
          font-family: 'IBM Plex Mono', monospace;
          transition: background 0.3s, border-color 0.3s;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nb.solid {
          background: var(--navbar-bg);
          backdrop-filter: blur(20px);
          border-bottom-color: var(--border-accent);
        }
        .nb-inner {
          max-width: 1400px; margin: 0 auto; height: 100%;
          display: flex; align-items: center; padding: 0 24px; gap: 0;
        }

        /* ── Logo ── */
        .nb-logo {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          opacity: 0; transform: translateX(-8px);
          transition: opacity 0.4s, transform 0.4s;
          flex-shrink: 0; margin-right: 32px;
        }
        .nb-logo.on { opacity: 1; transform: translateX(0); }
        .nb-mark {
          width: 28px; height: 28px; background: var(--accent);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s;
        }
        .nb-logo:hover .nb-mark { transform: rotate(30deg); }
        .nb-wordmark {
          font-family: 'Bebas Neue', sans-serif; font-size: 20px;
          letter-spacing: 0.08em; color: var(--text);
        }
        .nb-wordmark span { color: var(--accent); }

        /* ── Breadcrumb ── */
        .nb-crumb {
          display: flex; align-items: center; gap: 8px;
          font-size: 10px; letter-spacing: 0.12em; color: var(--dim);
          margin-right: 24px;
        }
        .nb-crumb-page { color: var(--accent); }

        /* ── Nav links ── */
        .nb-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .nb-link {
          padding: 6px 14px; font-size: 10px; letter-spacing: 0.14em;
          color: var(--muted); background: none; border: none; cursor: pointer;
          font-family: 'IBM Plex Mono', monospace;
          transition: color 0.2s, background 0.2s;
          border-radius: 3px; position: relative; overflow: visible ;
        }
        .nb-link::after {
          content: ''; position: absolute; bottom: 0; left: 50%; right: 50%;
          height: 1px; background: var(--accent);
          transition: left 0.25s, right 0.25s;
        }
        .nb-link:hover { color: var(--text); background: var(--accent-dim); }
        .nb-link:hover::after, .nb-link.active::after { left: 14px; right: 14px; }
        .nb-link.active { color: var(--accent); }

        /* ── Mock Test special pill link ── */
        .nb-link-mock {
          padding: 5px 12px; font-size: 10px; letter-spacing: 0.14em;
          color: var(--accent); background: var(--accent-dim);
          border: 1px solid var(--accent-border);
          cursor: pointer; font-family: 'IBM Plex Mono', monospace;
          transition: all 0.2s; border-radius: 3px;
          display: flex; align-items: center; gap: 6px;
          margin-left: 4px;
        }
        .nb-link-mock:hover {
          background: var(--accent); color: var(--bg);
          box-shadow: 0 4px 16px var(--accent-glow);
          transform: translateY(-1px);
        }
        .nb-link-mock.active {
          background: var(--accent); color: var(--bg);
        }
        .nb-link-mock-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: currentColor; flex-shrink: 0;
          animation: blink 2s infinite;
        }

        /* ── Clock ── */
        .nb-clock {
          font-size: 10px; letter-spacing: 0.1em; color: var(--dim);
          padding: 0 16px;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
          margin: 0 8px; font-variant-numeric: tabular-nums;
        }

        /* ── Login button ── */
        .nb-login {
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.12em;
          padding: 7px 18px; border: 1px solid var(--border-accent); color: var(--accent);
          background: transparent; cursor: pointer; border-radius: 2px;
          transition: all 0.2s;
        }
        .nb-login:hover { background: var(--accent); color: var(--bg); }

        /* ── Profile button ── */
        .nb-profile-btn {
          display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 4px;
          background: var(--accent-dim); border: 1px solid var(--border-accent);
          border-radius: 3px; cursor: pointer; transition: all 0.2s;
        }
        .nb-profile-btn:hover { background: rgba(var(--accent-rgb), 0.15); border-color: var(--accent); }
        .nb-avatar {
          width: 26px; height: 26px; background: var(--accent); color: var(--bg);
          font-size: 10px; font-weight: 700; display: flex; align-items: center;
          justify-content: center; border-radius: 2px;
        }
        .nb-uname  { font-size: 10px; letter-spacing: 0.08em; color: var(--accent); }
        .nb-chevron { color: var(--border-accent); transition: transform 0.2s; }
        .nb-profile-btn.open .nb-chevron { transform: rotate(180deg); }

        /* ── Dropdown ── */
        .nb-drop {
          position: absolute; top: calc(100% + 8px); right: 0; width: 200px;
          background: var(--surface); border: 1px solid var(--border-accent);
          border-radius: 4px; overflow: visible;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          z-index: 9999;
        }
        .nb-drop-header {
          padding: 12px 14px; border-bottom: 1px solid var(--border);
          background: var(--accent-dim);
        }
        .nb-drop-name  { font-size: 11px; color: var(--text); margin-bottom: 2px; }
        .nb-drop-email { font-size: 9px; color: var(--dim); letter-spacing: 0.05em; }
        .nb-drop-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          font-size: 10px; letter-spacing: 0.1em; color: var(--muted);
          cursor: pointer; border: none; background: none; width: 100%; text-align: left;
          font-family: 'IBM Plex Mono', monospace;
          transition: background 0.15s, color 0.15s;
        }
        .nb-drop-item:hover { background: var(--accent-dim); color: var(--accent); }
        .nb-drop-item.danger { color: rgba(239,68,68,0.6); }
        .nb-drop-item.danger:hover { background: rgba(239,68,68,0.08); color: #ef4444; }
        .nb-drop-item.mock-item { color: var(--accent); }
        .nb-drop-item.mock-item:hover { background: var(--accent); color: var(--bg); }
        .nb-drop-sep { height: 1px; background: var(--border); }

        /* ── Hamburger ── */
        .nb-ham {
          display: none; flex-direction: column; gap: 4px; cursor: pointer;
          padding: 6px; background: none; border: none;
        }
        .nb-ham span {
          display: block; width: 18px; height: 1px; background: var(--accent);
          transition: transform 0.3s, opacity 0.3s;
        }
        .nb-ham.open span:nth-child(1) { transform: translateY(5px) rotate(45deg); }
        .nb-ham.open span:nth-child(2) { opacity: 0; }
        .nb-ham.open span:nth-child(3) { transform: translateY(-5px) rotate(-45deg); }

        /* ── Mobile menu ── */
        .nb-mobile {
          position: fixed; top: var(--navbar-height); left: 0; right: 0;
          background: var(--navbar-bg); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-accent);
          padding: 16px 24px 24px; z-index: 400;
        }
        .nb-mobile-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid var(--border);
          font-size: 11px; letter-spacing: 0.12em; color: var(--muted);
          cursor: pointer; background: none; border-top: none; width: 100%;
          font-family: 'IBM Plex Mono', monospace; text-align: left;
          transition: color 0.2s;
        }
        .nb-mobile-link:hover { color: var(--accent); }
        .nb-mobile-link.mock { color: var(--accent); font-weight: 600; }

        @keyframes blink { 50% { opacity: 0; } }

        @media (max-width: 768px) {
          .nb-links, .nb-clock, .nb-login, .nb-profile { display: none !important; }
          .nb-ham { display: flex !important; }
        }
        @media (min-width: 769px) { .nb-mobile { display: none !important; } }
      `}</style>

      <nav className={`nb${scrolled || !isLanding ? " solid" : ""}`}>
        <div className="nb-inner">
          {/* Logo */}
          <div
            className={`nb-logo${mounted ? " on" : ""}`}
            onClick={() =>
              isLanding
                ? window.scrollTo({ top: 0, behavior: "smooth" })
                : navigate("/")
            }
          >
            <div className="nb-mark">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1L11 4V8L6 11L1 8V4L6 1Z"
                  fill="var(--bg)"
                  strokeWidth="0"
                />
              </svg>
            </div>
            <div className="nb-wordmark">
              CAREER<span>AI</span>
            </div>
          </div>

          {/* Breadcrumb */}
          <AnimatePresence>
            {!isLanding && pathLabel && (
              <motion.div
                className="nb-crumb"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.25 }}
              >
                <span style={{ opacity: 0.3 }}>/</span>
                <span className="nb-crumb-page">{pathLabel}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Links */}
          <div className="nb-links">
            {links.map((l) =>
              l.highlight ? (
                // Mock Test — styled as a pill/badge link
                <button
                  key={l.label}
                  className={`nb-link-mock${location.pathname === l.path ? " active" : ""}`}
                  onClick={l.action}
                >
                  <span className="nb-link-mock-dot" />
                  {l.label}
                </button>
              ) : (
                <button
                  key={l.label}
                  className={`nb-link${l.path && location.pathname === l.path ? " active" : ""}`}
                  onClick={l.action}
                >
                  {l.label}
                </button>
              ),
            )}
          </div>

          {/* Clock */}
          <div className="nb-clock">{time}</div>

          {/* Auth */}
          {!user ? (
            <button className="nb-login" onClick={() => navigate("/login")}>
              LOGIN →
            </button>
          ) : (
            <div
              ref={profileRef}
              style={{ position: "relative", zIndex: 9999 }}
              className="nb-profile"
            >
              <div
                className={`nb-profile-btn${profileOpen ? " open" : ""}`}
                onClick={() => setProfileOpen((o) => !o)}
              >
                <div className="nb-avatar">{initials}</div>
                <span className="nb-uname">
                  {user.name?.split(" ")[0]?.toUpperCase() ||
                    user.email?.split("@")[0]?.toUpperCase()}
                </span>
                <svg
                  className="nb-chevron"
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <path
                    d="M2 3.5L5 6.5L8 3.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="nb-drop"
                    initial={{ opacity: 0, y: -8, scaleY: 0.92 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.92 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="nb-drop-header">
                      <div className="nb-drop-name">{user.name || "User"}</div>
                      <div className="nb-drop-email">{user.email}</div>
                    </div>
                    {[
                      { p: "/dashboard", l: "DASHBOARD" },
                      { p: "/generate", l: "GENERATE" },
                      { p: "/mocktest", l: "MOCK TEST", mock: true },
                      { p: "/settings", l: "SETTINGS" },
                    ].map(({ p, l, mock }) => (
                      <button
                        key={p}
                        className={`nb-drop-item${mock ? " mock-item" : ""}`}
                        onClick={() => {
                          navigate(p);
                          setProfileOpen(false);
                        }}
                      >
                        <span
                          style={{
                            color:
                              location.pathname === p
                                ? "currentColor"
                                : undefined,
                          }}
                        >
                          {mock ? "◎" : "▸"}
                        </span>
                        {l}
                      </button>
                    ))}
                    <div className="nb-drop-sep" />
                    <button
                      className="nb-drop-item danger"
                      onClick={() => {
                        logout();
                        navigate("/");
                        setProfileOpen(false);
                      }}
                    >
                      ⏻ SIGN OUT
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Hamburger */}
          <div
            className={`nb-ham${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="nb-mobile"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {links.map((l) => (
                <button
                  key={l.label}
                  className={`nb-mobile-link${l.highlight ? " mock" : ""}`}
                  onClick={() => {
                    l.action();
                    setMenuOpen(false);
                  }}
                >
                  {l.label} <span style={{ color: "var(--accent)" }}>→</span>
                </button>
              ))}
              {!user ? (
                <button
                  className="nb-mobile-link"
                  style={{ color: "var(--accent)" }}
                  onClick={() => {
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                >
                  LOGIN →
                </button>
              ) : (
                <button
                  className="nb-mobile-link"
                  style={{ color: "#ef4444" }}
                  onClick={() => {
                    logout();
                    navigate("/");
                    setMenuOpen(false);
                  }}
                >
                  SIGN OUT
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
