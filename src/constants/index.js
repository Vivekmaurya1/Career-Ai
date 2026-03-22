// constants/index.js
// ─────────────────────────────────────────────────────────────────────────────

// ── Dashboard ────────────────────────────────────────────────────────────────

export const LEVEL_BADGE_MAP = {
  beginner:  { color: "var(--success)",  bg: "var(--success-bg)",  border: "var(--success-border)"  },
  inter:     { color: "var(--accent)",   bg: "var(--accent-dim)",  border: "var(--accent-border)"   },
  advan:     { color: "var(--danger)",   bg: "var(--danger-bg)",   border: "var(--danger-border)"   },
  expert:    { color: "var(--danger)",   bg: "var(--danger-bg)",   border: "var(--danger-border)"   },
  _default:  { color: "var(--text-dim)", bg: "var(--input-bg)",    border: "var(--border)"          },
};

// ── Layout ───────────────────────────────────────────────────────────────────
export const NAV_HEIGHT = 56;

// ── Site metadata ─────────────────────────────────────────────────────────────
export const SITE = {
  name: "CareerAI",
};

// ── Generate form ────────────────────────────────────────────────────────────

export const GENERATE_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Engineer",
  "Data Scientist", "ML Engineer", "DevOps Engineer",
  "Mobile Developer", "Product Manager", "UI/UX Designer", "Cloud Architect",
];

export const GENERATE_TIMES     = ["30 min", "1 hour", "2 hours", "3 hours", "4+ hours"];
export const GENERATE_DURATIONS = ["1 month", "2 months", "3 months", "6 months", "12 months"];
export const GENERATE_EXP_YEARS = ["0–1 years", "1–3 years", "3–5 years", "5–10 years", "10+ years"];

export const GENERATE_EXPERIENCE_LEVELS = [
  { val: "Beginner",     icon: "🌱", desc: "Just starting out"  },
  { val: "Intermediate", icon: "⚡", desc: "Some experience"    },
  { val: "Advanced",     icon: "🔥", desc: "Want to specialise" },
];

export const GENERATE_SESSION_KEY = "roadmap_generation_state";

export const GENERATE_LOG_LINES = [
  "> Scanning 10,000+ career trajectories...",
  "> Mapping prerequisite graph...",
  "> Building phase structure...",
  "> Generating weekly schedule...",
  "> Preparing project suggestions...",
  "> Compiling interview prep suite...",
  "> Finalizing your roadmap...",
];

export const GENERATE_WAITING_MSGS = [
  "> Server is processing...",
  "> Almost there...",
  "> Hang tight...",
  "> Crunching data...",
  "> Polishing your roadmap...",
];

// ── Landing page ─────────────────────────────────────────────────────────────

export const LANDING_ROLES = [
  "Frontend Developer", "Data Scientist", "DevOps Engineer",
  "ML Engineer", "Backend Dev", "Product Manager",
];

export const LANDING_STATS = [
  { n: 2400, suffix: "+", label: "ROADMAPS GENERATED" },
  { n: 98,   suffix: "%", label: "SATISFACTION RATE"  },
  { n: 30,   suffix: "s", label: "SETUP TIME"         },
];

export const LANDING_FEATURES = [
  { icon: "01", title: "AI ROADMAP GENERATOR",   tag: "CORE",    desc: "Describe your goal. Get a fully structured learning plan with phases, milestones, and timelines — generated in under 30 seconds." },
  { icon: "02", title: "PREREQUISITE MAPPING",    tag: "CORE",    desc: "Every topic links its dependencies so you always know what to learn first. Never hit a wall again." },
  { icon: "03", title: "REAL PROJECT ENGINE",     tag: "PREMIUM", desc: "Each phase unlocks curated projects that reinforce your new skills. Learn by building actual things." },
  { icon: "04", title: "WEEKLY SCHEDULER",        tag: "CORE",    desc: "Your roadmap auto-schedules into bite-sized weekly goals based on your available hours per day." },
  { icon: "05", title: "INTERVIEW PREP SUITE",    tag: "PREMIUM", desc: "Role-specific question banks, system design primers, and coding patterns — tailored to your target level." },
  { icon: "06", title: "PROGRESS TRACKING",       tag: "CORE",    desc: "Visual checkpoints and phase completion rings keep you accountable and on pace with your goals." },
];

export const LANDING_STEPS = [
  { n: "01", title: "DEFINE GOAL",     desc: "Enter target role and experience level. The more specific, the more precision your roadmap delivers.", items: ["Target role", "Experience level", "Daily availability"] },
  { n: "02", title: "AI BUILDS PLAN",  desc: "Our model analyzes thousands of career trajectories to build a phase-by-phase roadmap unique to you.",  items: ["Phase structure", "Topic ordering", "Time estimates"] },
  { n: "03", title: "EXECUTE & SHIP",  desc: "Follow your interactive plan, check off topics, unlock projects, and become job-ready fast.",             items: ["Track progress", "Build projects", "Prep interviews"] },
];

// ── RoadmapPage ───────────────────────────────────────────────────────────────

export const ROADMAP_TABS = ["PHASES", "WEEKLY", "PROJECTS", "INTERVIEW"];

export const PHASE_COLORS = [
  { accent: "#3b82f6", dim: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.25)",  badge: "#1d4ed8" },
  { accent: "#06b6d4", dim: "rgba(6,182,212,0.08)",   border: "rgba(6,182,212,0.25)",   badge: "#0e7490" },
  { accent: "#22c55e", dim: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)",   badge: "#15803d" },
  { accent: "#a855f7", dim: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.25)",  badge: "#7e22ce" },
  { accent: "#f59e0b", dim: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  badge: "#b45309" },
  { accent: "#ef4444", dim: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   badge: "#b91c1c" },
];

// ── MockTest ──────────────────────────────────────────────────────────────────

export const MOCK_EXPERIENCE_OPTIONS = [
  { value: "0-6 months",  label: "< 6 months",  badge: "Fresher"   },
  { value: "6-12 months", label: "6–12 months", badge: "Junior"    },
  { value: "1-2 years",   label: "1–2 years",   badge: "Junior"    },
  { value: "2-4 years",   label: "2–4 years",   badge: "Mid-level" },
  { value: "4-7 years",   label: "4–7 years",   badge: "Senior"    },
  { value: "7+ years",    label: "7+ years",    badge: "Principal" },
];

export const MOCK_LEVEL_OPTIONS      = ["Beginner", "Intermediate", "Advanced"];
export const MOCK_DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

export const MOCK_TYPE_OPTIONS = [
  { value: "mixed",   label: "Mixed",    desc: "20 MCQ + 5 Written" },
  { value: "quiz",    label: "MCQ Only", desc: "25 Multiple Choice"  },
  { value: "writing", label: "Written",  desc: "25 Descriptive"      },
];

export const MOCK_DIFF_COLORS = {
  easy:   { bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.3)",  text: "#4ade80" },
  medium: { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24" },
  hard:   { bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", text: "#f87171" },
  _default: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", text: "#94a3b8" },
};

export const MOCK_LEVEL_META = {
  BEGINNER:     { color: "#4ade80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.3)"   },
  INTERMEDIATE: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.3)"   },
  ADVANCED:     { color: "#818cf8", bg: "rgba(129,140,248,0.1)",  border: "rgba(129,140,248,0.35)" },
};

export const MOCK_READINESS_META = {
  "Not Ready":       { color: "#f87171", icon: "✗" },
  "Partially Ready": { color: "#fbbf24", icon: "◐" },
  "Ready":           { color: "#4ade80", icon: "✓" },
};

// ── ThemeContext ──────────────────────────────────────────────────────────────
// bg / accent values here are used ONLY for the Settings preview cards.
// Real CSS variables live in themes.css.

export const THEMES = [
  // ── Static themes ──────────────────────────────────────────────────────────
  {
    id: "dark",
    label: "Monochrome",
    bg: "#050505",
    accent: "#e2e8f0",
    animated: false,
    description: "Stark white on pure black",
  },
  {
    id: "darker",
    label: "Midnight Mint",
    bg: "#050816",
    accent: "#5eead4",
    animated: false,
    description: "Deep navy meets cool teal",
  },
  {
    id: "amber",
    label: "Executive Gold",
    bg: "#0d0a04",
    accent: "#fbbf24",
    animated: false,
    description: "Rich black with burnished gold",
  },
  {
    id: "green",
    label: "Evergreen",
    bg: "#030d06",
    accent: "#4ade80",
    animated: false,
    description: "Forest dark with emerald glow",
  },
  {
    id: "blue",
    label: "Cobalt",
    bg: "#040a18",
    accent: "#60a5fa",
    animated: false,
    description: "Deep navy with electric blue",
  },
  {
    id: "violet",
    label: "Plum Slate",
    bg: "#0e0a1c",
    accent: "#c4b5fd",
    animated: false,
    description: "Dark plum with soft lavender",
  },
  // ── Animated themes ────────────────────────────────────────────────────────
  {
    id: "aurora",
    label: "Aurora",
    bg: "#020912",
    accent: "#67e8f9",
    animated: true,
    description: "Shifting northern lights atmosphere",
  },
  {
    id: "nebula",
    label: "Nebula",
    bg: "#060310",
    accent: "#c084fc",
    animated: true,
    description: "Drifting cosmic purple clouds",
  },
  {
    id: "inferno",
    label: "Inferno",
    bg: "#0a0200",
    accent: "#fb923c",
    animated: true,
    description: "Rising lava core with heat shimmer",
  },
  {
    id: "matrix",
    label: "Matrix",
    bg: "#000800",
    accent: "#22c55e",
    animated: true,
    description: "Digital rain on pure black",
  },
  {
    id: "shadow",
    label: "Ethereal",
    bg: "#000000",
    accent: "#e2e8f0",
    animated: true,
    description: "Turbulence shadow displacement",
  },
];

export const THEME_STORAGE_KEY      = "careerai-theme";
export const DEFAULT_THEME_ID       = "dark";
export const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;