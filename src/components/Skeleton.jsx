/**
 * Skeleton primitives. Replace the spinner UI on initial load so the layout
 * doesn't reflow when real data lands.
 *
 *   <Skeleton className="h-4 w-32" />     // arbitrary block
 *   <SkillCardSkeleton />                  // mirrors SkillCard footprint
 *   <CommunityCardSkeleton />              // mirrors CommunityCard footprint
 *
 * All shapes share the same pulsing surface tone so a grid of them reads as
 * one quiet loading state, not as confetti.
 */

const SURFACE_BG = "var(--pl-surface, #e2e8f0)";

export const Skeleton = ({ className = "", style }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-slate-200 ${className}`}
    style={{ background: SURFACE_BG, ...style }}
  />
);

/** Mirrors SkillCard: avatar + name/dept + 3 skill rows + footer line. */
export const SkillCardSkeleton = () => (
  <div className="pl-card overflow-hidden" aria-hidden="true">
    <div className="flex items-start gap-3 mb-5">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-16 mt-1.5" />
      </div>
    </div>

    <div className="space-y-2.5 mb-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-1.5 rounded-full" style={{ width: 70 }} />
          <Skeleton className="h-3 w-4" />
        </div>
      ))}
    </div>

    <div className="pt-4" style={{ borderTop: "1px solid var(--pl-line)" }}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

/** Mirrors CommunityCard: title + chip + description + meta + action. */
export const CommunityCardSkeleton = () => (
  <div className="pl-card p-5" aria-hidden="true">
    <div className="flex justify-between items-start gap-3 mb-3">
      <Skeleton className="h-5 w-3/5" />
      <Skeleton className="h-4 w-14 rounded-full shrink-0" />
    </div>
    <div className="space-y-2 mb-4">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
    <Skeleton className="h-3 w-24 mb-4" />
    <Skeleton className="h-9 w-full rounded-xl" />
  </div>
);

/** Six-tile grid wrapper for cards above. */
export const CardSkeletonGrid = ({ kind = "skill", count = 6 }) => {
  const Card = kind === "community" ? CommunityCardSkeleton : SkillCardSkeleton;
  return (
    <div
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
