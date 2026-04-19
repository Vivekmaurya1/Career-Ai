// Roadmap UI Constants & Style Definitions
export const LEVEL_COLORS = {
  advanced: { accent: "var(--warning)", border: "var(--warning-border)" },
  intermediate: { accent: "var(--accent)", border: "var(--accent-border)" },
  beginner: { accent: "var(--success)", border: "var(--success-border)" },
};

export const COMMON_RADIUSES = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "999px",
};

export const COMMON_TRANSITIONS = {
  fast: "all 0.15s ease",
  normal: "all 0.2s ease",
  smooth: "all 0.3s ease",
  extended: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
};

export const FONT_FAMILIES = {
  display: "'Syne', sans-serif",
  mono: "'DM Mono', monospace",
  sans: "'DM Sans', sans-serif",
};

export const BUTTON_BASE = {
  cursor: "pointer",
  border: "none",
  padding: 0,
  fontFamily: "inherit",
  transition: COMMON_TRANSITIONS.normal,
};

export const SIDEBAR_CONFIG = {
  width: 340,
  zIndex: 1200,
};

export const PANEL_CONFIG = {
  zIndex: 2000,
  maxWidth: 900,
};

export const GRID_GAPS = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  xxl: "20px",
};

export const SHADOW_PRESET = {
  sm: "0 2px 8px rgba(0, 0, 0, 0.4)",
  md: "0 4px 20px rgba(0, 0, 0, 0.5)",
  lg: "0 8px 48px rgba(0, 0, 0, 0.7)",
};
