import { Skeleton } from "./Skeleton";

/**
 * Suspense fallback for lazy-loaded routes. Stays out of the way: a few
 * skeleton bars where the page header / first card row will end up, so the
 * layout doesn't jump when the real component lands. No full-screen overlay,
 * no spinner — same quiet treatment as the per-page skeletons elsewhere.
 */
const RouteFallback = () => (
  <main
    className="max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-6"
    aria-busy="true"
    aria-live="polite"
  >
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-5 w-1/2" />
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  </main>
);

export default RouteFallback;
