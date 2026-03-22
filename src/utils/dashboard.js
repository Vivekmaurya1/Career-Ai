// utils/dashboard.js
import { LEVEL_BADGE_MAP } from "../constants";

/** Normalize any API shape into a plain array. */
export const normalizeList = (data) =>
  Array.isArray(data) ? data : data?.data ?? data?.roadmaps ?? [];

/** Format a date string to "Jan 1, 2025". */
export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Return the CSS color tokens for a level badge. */
export const getLevelBadge = (level = "") => {
  const l = level.toLowerCase();
  if (l.includes("begin")) return LEVEL_BADGE_MAP.beginner;
  if (l.includes("inter")) return LEVEL_BADGE_MAP.inter;
  if (l.includes("advan") || l.includes("expert")) return LEVEL_BADGE_MAP.advan;
  return LEVEL_BADGE_MAP._default;
};

/** Given an array of roadmaps, return the most recent creation date as a short string. */
export const getLatestDate = (roadmaps) => {
  if (!roadmaps.length) return "--";
  return new Date(
    Math.max(...roadmaps.map((r) => new Date(r.createdAt)))
  ).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};