/**
 * Tiny invalidate bus for the `useQuery` hook family.
 *
 * Why it exists: we don't want React Query in this sprint (extra surface,
 * learning curve, more bundle). But we DO want the property "mutate → all
 * components showing this data refetch automatically". This module gives us
 * exactly that, in ~20 lines.
 *
 * Usage:
 *   // in a hook
 *   useEffect(() => onInvalidate(key, refetch), [key, refetch]);
 *
 *   // in a mutation
 *   await api.post(...);
 *   invalidate("channels:abc123");
 *
 * Keys are arbitrary strings. Convention: `<resource>:<id>` or just `<resource>`
 * for collection-level keys. See src/hooks/use*.js for examples.
 */

const target = new EventTarget();
const EVENT = "invalidate";

/** Subscribe to invalidation of `key`. Returns an unsubscribe function. */
export const onInvalidate = (key, callback) => {
  if (!key) return () => {};
  const handler = (e) => {
    if (e.detail?.key === key) callback();
  };
  target.addEventListener(EVENT, handler);
  return () => target.removeEventListener(EVENT, handler);
};

/** Tell every hook subscribed to `key` to refetch. */
export const invalidate = (key) => {
  if (!key) return;
  target.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
};
