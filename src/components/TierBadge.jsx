import { tierForLevel } from "../utils/levelTier";

/**
 * Small pill showing the user's current tier (Bronze / Silver / Gold / Diamond).
 * Renders nothing if the level hasn't unlocked any tier yet.
 */
const TierBadge = ({ level, size = "md" }) => {
  const tier = tierForLevel(level);
  if (!tier) return null;

  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide ${sizes[size] ?? sizes.md}`}
      style={{ backgroundColor: tier.color, color: tier.text }}
      title={`${tier.name} tier — unlocks at level ${tier.min}`}
    >
      {tier.name}
    </span>
  );
};

export default TierBadge;
