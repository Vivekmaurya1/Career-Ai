import styles from "./Footer.module.css";

const NAV = {
  Product:  ["Generate Roadmap", "Mock Test", "Dashboard", "How It Works"],
  Company:  ["About", "Blog", "Careers", "Press"],
  Legal:    ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

const SOCIALS = [
  {
    label: "X / Twitter",
    icon: (
      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
        <path d="M10 1.5H11.9L7.6 6.4L12.5 13H8.4L5.2 8.8L1.5 13H-0.4L4.3 7.8L-0.5 1.5H3.7L6.6 5.4L10 1.5Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    icon: (
      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M6.5 0C2.91 0 0 2.91 0 6.5C0 9.38 1.87 11.82 4.47 12.73C4.82 12.79 4.93 12.58 4.93 12.4V11.07C3.25 11.45 2.87 10.32 2.87 10.32C2.55 9.49 2.08 9.27 2.08 9.27C1.43 8.85 2.13 8.86 2.13 8.86C2.85 8.91 3.23 9.6 3.23 9.6C3.88 10.71 4.92 10.39 5.08 10.2C5.14 9.77 5.32 9.45 5.51 9.27C4.16 9.09 2.74 8.57 2.74 6.22C2.74 5.45 3.02 4.82 3.45 4.33C3.38 4.15 3.13 3.43 3.52 2.45C3.52 2.45 4.13 2.26 5.04 2.85C5.52 2.72 6.03 2.65 6.54 2.65C7.05 2.65 7.56 2.72 8.04 2.85C8.95 2.26 9.56 2.45 9.56 2.45C9.95 3.43 9.7 4.15 9.63 4.33C10.06 4.82 10.34 5.45 10.34 6.22C10.34 8.57 8.92 9.09 7.57 9.27C7.8 9.49 8.01 9.92 8.01 10.59V12.4C8.01 12.58 8.12 12.8 8.47 12.73C11.13 11.82 13 9.38 13 6.5C13 2.91 10.09 0 6.5 0Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    icon: (
      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
        <path d="M2 4.5H4V13H2V4.5ZM3 3.5C2.2 3.5 1.5 2.85 1.5 2C1.5 1.15 2.2 0.5 3 0.5C3.8 0.5 4.5 1.15 4.5 2C4.5 2.85 3.8 3.5 3 3.5ZM12.5 13H10.5V8.9C10.5 7.95 10.48 6.75 9.2 6.75C7.85 6.75 7.65 7.77 7.65 8.83V13H5.65V4.5H7.55V5.6H7.58C7.9 4.97 8.7 4.3 9.85 4.3C12.2 4.3 12.5 5.97 12.5 8.15V13Z" fill="currentColor"/>
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className={styles.root} aria-label="Site footer">
      <div className="container">
        <div className={styles.grid}>

          {/* Brand */}
          <div className={styles.brand}>
            <a href="/" className={styles.logo} aria-label="CareerAI home">
              <div className={styles.logoMark} aria-hidden>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="#07080b"/>
                </svg>
              </div>
              <span className={styles.logoName}>Career<span className={styles.logoAccent}>AI</span></span>
            </a>

            <p className={styles.desc}>
              Focused planning for serious career moves.
              From goal to offer in weeks, not months.
            </p>

            <div className={styles.socials}>
              {SOCIALS.map(s => (
                <a key={s.label} href="#" aria-label={s.label} className={styles.social}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(NAV).map(([group, items]) => (
            <div key={group} className={styles.col}>
              <div className={styles.colHead}>{group}</div>
              <ul className={styles.colLinks}>
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className={styles.colLink}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>© 2026 CareerAI Inc. All rights reserved.</span>
          <div className={styles.status}>
            <span className={styles.statusDot}/>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}