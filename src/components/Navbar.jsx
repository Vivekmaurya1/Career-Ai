// components/Navbar/Navbar.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useClickOutside, useBodyScrollLock } from "../hooks/useScrollAnimation";
import styles from "./Navbar.module.css";

const NAV_LANDING = [
  { label: "Features",     href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing",      href: "#pricing" },
];

const NAV_APP = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Generate",  href: "/generate" },
  { label: "Mock Test", href: "/mocktest" },
];

/* Pill component used inside the mock-test context bar */
function ContextPill({ children, variant = "default", style = {} }) {
  const variants = {
    default: { bg: "var(--bg-2,#161616)", brd: "var(--brd,rgba(255,255,255,0.08))", color: "var(--t2,#aaa)" },
    accent:  { bg: "var(--a-dim)",         brd: "var(--a-brd)",                       color: "var(--a)"        },
    success: { bg: "rgba(74,222,128,0.1)",  brd: "rgba(74,222,128,0.3)",               color: "#4ade80"         },
    error:   { bg: "rgba(248,113,113,0.1)", brd: "rgba(248,113,113,0.3)",              color: "#f87171"         },
    warn:    { bg: "rgba(251,191,36,0.1)",  brd: "rgba(251,191,36,0.3)",               color: "#fbbf24"         },
  };
  const v = variants[variant] ?? variants.default;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      background: v.bg, border: `1px solid ${v.brd}`,
      fontFamily: "var(--font-mono,'JetBrains Mono',monospace)",
      fontSize: 10, letterSpacing: "0.05em",
      color: v.color,
      whiteSpace: "nowrap",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* Difficulty variant lookup */
function diffVariant(d) {
  if (!d) return "default";
  const lower = d.toLowerCase();
  if (lower === "easy")   return "success";
  if (lower === "medium") return "warn";
  if (lower === "hard")   return "error";
  return "default";
}

export default function Navbar({ isLanding = false, mockTestMeta = null }) {
  /*
    mockTestMeta — pass this prop from MockTestPage when on /mocktest.
    Shape: { phase, role, experience, difficulty, answered, totalQ, timeMinutes }
    When null/undefined the navbar renders its normal mode.
  */

  const { user, logout, initials } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useClickOutside(() => setProfileOpen(false));
  useBodyScrollLock(mobileOpen);

  const isMockTest = location.pathname === "/mocktest";
  /* Show the contextual bar only if we're on /mocktest AND a phase other than 'form' is active */
  const showTestContext = isMockTest && mockTestMeta && mockTestMeta.phase !== "form";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const links = user ? NAV_APP : NAV_LANDING;

  const handleNavClick = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    } else {
      navigate(href);
    }
  };

  return (
    <>
      <header
        className={`${styles.shell} ${scrolled ? styles.scrolled : ""} ${isMockTest ? styles.mockTestShell : ""}`}
        role="banner"
      >
        <div className={`container ${styles.inner}`}>

          {/* Logo */}
          <a href="/" className={styles.logo} aria-label="CareerAI home">
            <div className={styles.logoMark} aria-hidden>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="currentColor"/>
              </svg>
            </div>
            <span className={styles.logoName}>
              Career<span className={styles.logoAccent}>AI</span>
            </span>
          </a>

          {/* ── NORMAL nav (hidden during active mock test) ── */}
          {!showTestContext && (
            <nav className={styles.links} aria-label="Main navigation">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`${styles.link} ${location.pathname === link.href ? styles.active : ""}`}
                  aria-current={location.pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* ── MOCK TEST context bar ── */}
          {showTestContext && (
            <div className={styles.testContextBar} aria-label="Test context">

              {/* Live pulse — only during quiz phase */}
              {mockTestMeta.phase === "quiz" && (
                <ContextPill variant="success">
                  <span className={styles.liveDot} aria-hidden />
                  LIVE
                </ContextPill>
              )}

              {/* Role */}
              {mockTestMeta.role && (
                <ContextPill>{mockTestMeta.role}</ContextPill>
              )}

              {/* Experience */}
              {mockTestMeta.experience && (
                <ContextPill>{mockTestMeta.experience}</ContextPill>
              )}

              {/* Difficulty */}
              {mockTestMeta.difficulty && (
                <ContextPill variant={diffVariant(mockTestMeta.difficulty)}>
                  {mockTestMeta.difficulty.charAt(0).toUpperCase() + mockTestMeta.difficulty.slice(1)}
                </ContextPill>
              )}

              {/* Result badge */}
              {mockTestMeta.phase === "result" && (
                <ContextPill variant="accent">Complete</ContextPill>
              )}
            </div>
          )}

          {/* ── Right side ── */}
          <div className={`${styles.right} ${showTestContext ? styles.testRight : ""}`}>

            {/* Progress pill — quiz only */}
            {showTestContext && mockTestMeta.phase === "quiz" && mockTestMeta.totalQ > 0 && (
              <div className={styles.progressPill} aria-label={`${mockTestMeta.answered} of ${mockTestMeta.totalQ} answered`}>
                <span className={styles.progressCount}>
                  {mockTestMeta.answered}/{mockTestMeta.totalQ}
                </span>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.round((mockTestMeta.answered / mockTestMeta.totalQ) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Normal auth buttons — hidden during active mock test */}
            {!showTestContext && !user && (
              <>
                <a href="/login" className={styles.btnGhost}>Sign in</a>
                <a href="/generate" className={styles.btnAccent}>
                  Get started
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </>
            )}

            {/* Profile dropdown — always shown when logged in */}
            {user && (
              <div ref={profileRef} className={styles.profileWrap}>
                <button
                  className={`${styles.profileBtn} ${profileOpen ? styles.profileOpen : ""}`}
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label="User menu"
                >
                  <div className={styles.avatar} aria-hidden>{initials}</div>
                  {/* Hide name text during test context to save space */}
                  {!showTestContext && (
                    <span className={styles.profileName}>{user.name?.split(" ")[0] ?? "User"}</span>
                  )}
                  <svg
                    width="10" height="10" viewBox="0 0 12 12" fill="none"
                    style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 200ms var(--ease)" }}
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>

                {profileOpen && (
                  <div className={styles.dropdown} role="menu" aria-label="User menu">
                    <div className={styles.dropHead}>
                      <div className={styles.dropAvatar}>{initials}</div>
                      <div>
                        <div className={styles.dropName}>{user.name}</div>
                        <div className={styles.dropEmail}>{user.email}</div>
                      </div>
                    </div>
                    <div className={styles.dropItems}>
                      {[
                        { label: "Dashboard", href: "/dashboard" },
                        { label: "Generate",  href: "/generate" },
                        { label: "Mock Test", href: "/mocktest" },
                        { label: "Settings",  href: "/settings" },
                      ].map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className={styles.dropItem}
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                        >
                          {item.label}
                        </a>
                      ))}
                      <div className={styles.dropDivider} role="separator"/>
                      <button
                        className={`${styles.dropItem} ${styles.dropDanger}`}
                        onClick={() => { logout(); setProfileOpen(false); }}
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger — hidden during active mock test */}
          {!showTestContext && (
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <span aria-hidden/><span aria-hidden/><span aria-hidden/>
            </button>
          )}
        </div>
      </header>

      {/* Mobile panel — hidden during active mock test */}
      {mobileOpen && !showTestContext && (
        <div
          id="mobile-nav"
          className={styles.mobilePanel}
          role="dialog"
          aria-label="Navigation menu"
          aria-modal="true"
        >
          <div className={styles.mobilePanelInner}>
            <nav className={styles.mobileLinks} aria-label="Mobile navigation">
              {links.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`${styles.mobileLink} ${location.pathname === link.href ? styles.active : ""}`}
                  onClick={(e) => handleNavClick(e, link.href)}
                  style={{ animationDelay: `${i * 0.055}s` }}
                >
                  <span className={styles.mobileLinkNum} aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className={styles.mobileDivider} aria-hidden/>
            <div className={styles.mobileActions}>
              {!user ? (
                <>
                  <a href="/login"    className={styles.mobileGhost}  onClick={() => setMobileOpen(false)}>Sign in</a>
                  <a href="/generate" className={styles.mobileAccent} onClick={() => setMobileOpen(false)}>Get started →</a>
                </>
              ) : (
                <>
                  <a href="/settings" className={styles.mobileGhost} onClick={() => setMobileOpen(false)}>Settings</a>
                  <button className={styles.mobileDanger} onClick={() => { logout(); setMobileOpen(false); }}>
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}