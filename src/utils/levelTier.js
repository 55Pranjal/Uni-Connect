/**
 * Maps a level → tier badge metadata. Tiers unlock at fixed levels and stay
 * permanent — they're the user-visible "reward" for leveling up.
 */
const TIERS = [
  { min: 20, name: "Diamond", color: "#38bdf8", text: "#0c4a6e" },
  { min: 15, name: "Gold",    color: "#facc15", text: "#713f12" },
  { min: 10, name: "Silver",  color: "#94a3b8", text: "#1e293b" },
  { min:  5, name: "Bronze",  color: "#f59e0b", text: "#451a03" },
];

/**
 * Returns the highest tier whose `min` ≤ level, or null if no tier unlocked.
 *
 * @param {number} level
 * @returns {{ name: string, color: string, text: string, min: number } | null}
 */
export function tierForLevel(level) {
  if (typeof level !== "number" || level < TIERS[TIERS.length - 1].min) return null;
  return TIERS.find((t) => level >= t.min) ?? null;
}

/** Returns the next tier the user hasn't unlocked yet, or null if at top. */
export function nextTierForLevel(level) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (level < TIERS[i].min) return TIERS[i];
  }
  return null;
}
