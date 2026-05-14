import { useEffect, useState, useCallback } from "react";
import { getMyXp } from "../api/user";

/**
 * Compact level + XP progress indicator for the Navbar / profile.
 *
 * Self-fetches its data and listens for a window-level `xp:refresh` event so
 * any component that awards XP can trigger a refresh by dispatching:
 *   window.dispatchEvent(new CustomEvent("xp:refresh"))
 */
const LevelBadge = ({ compact = false }) => {
  const [data, setData] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await getMyXp();
      setData(res.data);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("xp:refresh", handler);
    return () => window.removeEventListener("xp:refresh", handler);
  }, [refresh]);

  if (!data) return null;

  const { xp, level, levelXp, nextLevelXp, xpToNextLevel } = data;
  const bandSize = nextLevelXp - levelXp;
  const progress =
    bandSize > 0 ? Math.max(0, Math.min(1, (xp - levelXp) / bandSize)) : 1;

  return (
    <div
      className={`flex items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}
      title={`${xp} XP · ${xpToNextLevel} to Lv. ${level + 1}`}
    >
      <span
        className="font-semibold whitespace-nowrap"
        style={{ color: "var(--pl-ink)" }}
      >
        Lv {level}
      </span>
      <div
        className={`rounded-full overflow-hidden ${
          compact ? "w-16 h-1.5" : "w-24 h-2"
        }`}
        style={{ background: "var(--pl-line)" }}
      >
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${progress * 100}%`,
            background: "var(--pl-accent)",
          }}
        />
      </div>
    </div>
  );
};

export default LevelBadge;
