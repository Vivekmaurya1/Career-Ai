// utils/mocktest.js
import { MOCK_DIFF_COLORS } from "../constants";

/** Returns color tokens for a difficulty string. */
export const diffColor = (d) =>
  MOCK_DIFF_COLORS[d?.toLowerCase()] ?? MOCK_DIFF_COLORS._default;

/** Parses a score string like "18/25" → { pct: 72, raw: "18/25" }. */
export const parseScore = (s) => {
  if (!s) return { pct: 0, raw: "0/0" };
  const parts = s.split("/");
  if (parts.length === 2) {
    const pct = Math.round((parseFloat(parts[0]) / parseFloat(parts[1])) * 100) || 0;
    return { pct, raw: s };
  }
  return { pct: parseInt(s) || 0, raw: s };
};