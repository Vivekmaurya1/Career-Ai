// utils/roadmap.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure data-normalization helpers.
// These transform the raw API response into a predictable shape so every
// component downstream can rely on consistent field names.
// ─────────────────────────────────────────────────────────────────────────────

// ── Primitive helpers ─────────────────────────────────────────────────────────

/** Returns the first non-empty string / number found among the given keys. */
export const safeStr = (obj, ...keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number")             return String(v);
  }
  return "";
};

/** Returns the first non-empty array found among the given keys. */
export const safeArr = (obj, ...keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v) && v.length) return v;
  }
  return [];
};

// ── Normalizers ───────────────────────────────────────────────────────────────

export const normalizeTopic = (t) =>
  typeof t === "string"
    ? { topic_name: t, subtopics: [], concepts_to_master: [], recommended_practice: [], mini_project: null }
    : {
        topic_name:             safeStr(t, "topic_name", "topicName", "name", "title", "topic"),
        subtopics:              safeArr(t, "subtopics", "sub_topics"),
        concepts_to_master:     safeArr(t, "concepts_to_master", "conceptsToMaster", "concepts"),
        recommended_practice:   safeArr(t, "recommended_practice", "recommendedPractice", "practice"),
        mini_project:           t.mini_project ?? t.miniProject ?? t.project ?? null,
      };

export const normalizePhase = (p) => ({
  phase_title: safeStr(p, "phase_title", "phaseTitle", "title", "name"),
  duration:    safeStr(p, "duration", "time", "timeframe"),
  outcome:     safeStr(p, "outcome", "goal", "objective"),
  topics:      safeArr(p, "topics", "topic_list").map(normalizeTopic),
});

export const normalizeWeek = (w, i) =>
  typeof w === "string"
    ? { week: i + 1, focus: w, topics_to_cover: [], practice_goals: [], project_milestone: "" }
    : {
        week:              w.week_number ?? w.week ?? i + 1,
        focus:             safeStr(w, "focus", "theme", "title", "topic", "description"),
        topics_to_cover:   safeArr(w, "topics_to_cover", "topicsToCover", "topics"),
        practice_goals:    safeArr(w, "practice_goals", "practiceGoals", "goals", "exercises"),
        project_milestone: safeStr(w, "project_milestone", "milestone", "project"),
      };

export const normalizeStage = (s) =>
  typeof s === "string"
    ? { stage: s, focus_areas: [], common_questions: [], mock_strategy: "" }
    : {
        stage:            safeStr(s, "stage", "name", "title", "round"),
        focus_areas:      safeArr(s, "focus_areas", "focusAreas", "areas", "topics", "skills"),
        common_questions: safeArr(s, "common_questions", "commonQuestions", "questions"),
        mock_strategy:    safeStr(s, "mock_strategy", "mockStrategy", "strategy", "tip"),
      };

export const normalizeProject = (p) =>
  typeof p === "string"
    ? { title: p, description: "", features: [], core_topics_used: [], expected_outcome: "" }
    : {
        title:             safeStr(p, "title", "name", "project_name"),
        description:       safeStr(p, "description", "desc", "summary"),
        features:          safeArr(p, "features", "feature_list"),
        core_topics_used:  safeArr(p, "core_topics_used", "coreTopicsUsed", "topics_used", "tech_stack"),
        expected_outcome:  safeStr(p, "expected_outcome", "expectedOutcome", "outcome"),
      };

export const normalizeProjects = (raw) => {
  if (!raw) return {};
  if (Array.isArray(raw)) return { beginner: raw.map(normalizeProject) };
  const result = {};
  for (const level of ["beginner", "intermediate", "advanced"]) {
    const items = raw[level];
    if (Array.isArray(items) && items.length) result[level] = items.map(normalizeProject);
  }
  if (!Object.keys(result).length) {
    for (const [k, v] of Object.entries(raw)) {
      if (Array.isArray(v)) result[k] = v.map(normalizeProject);
    }
  }
  return result;
};

export const normalizeRoadmap = (raw) => {
  if (!raw) return null;
  const ir = safeArr(raw, "interview_preparation", "interviewPreparation", "interview_prep", "interview");
  return {
    title:                 safeStr(raw, "title"),
    role:                  safeStr(raw, "role"),
    phases:                safeArr(raw, "phases", "learning_phases").map(normalizePhase),
    projects:              normalizeProjects(raw.projects ?? raw.project_list ?? {}),
    weekly_plan:           safeArr(raw, "weekly_plan", "weeklyPlan", "weekly_schedule", "weeks", "schedule").map(normalizeWeek),
    interview_preparation: ir.map(normalizeStage),
  };
};

// ── Progress helpers ──────────────────────────────────────────────────────────

export const progressStorageKey  = (id) => `roadmap_progress_${id}`;

export const loadLocalProgress = (id) => {
  try {
    const raw = localStorage.getItem(progressStorageKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const saveLocalProgress = (id, data) => {
  try { localStorage.setItem(progressStorageKey(id), JSON.stringify(data)); } catch {}
};

/** Computes an overall % across all four sections (phases, weekly, projects, interview). */
export const calcOverallPercent = (progress, phases, weekly, projects, interview) => {
  const allProjects = ["beginner", "intermediate", "advanced"]
    .flatMap((l) => (projects[l] || []).map((_, i) => `${l}-${i}`));

  const topicKeys = phases.flatMap((p, pi) => p.topics.map((_, ti) => `phase-${pi}-topic-${ti}`));
  const weekKeys  = weekly.flatMap((w, i) => {
    const keys = [`week-${i}`];
    (w.topics_to_cover || []).forEach((_, j) => keys.push(`week-${i}-topic-${j}`));
    (w.practice_goals   || []).forEach((_, j) => keys.push(`week-${i}-practice-${j}`));
    return keys;
  });
  const projKeys = allProjects.map((k) => `project-${k}`);
  const ivKeys   = interview.map((_, i) => `interview-${i}`);

  const pct = (keys) => {
    if (!keys.length) return 100;
    return Math.round((keys.filter((k) => progress[k]).length / keys.length) * 100);
  };

  const sections = [pct(topicKeys), pct(weekKeys), pct(projKeys), pct(ivKeys)];
  return Math.round(sections.reduce((a, b) => a + b, 0) / sections.length);
};