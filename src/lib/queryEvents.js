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
 *
 * Cross-tab: when BroadcastChannel is available, invalidate(key) also reaches
 * other tabs of the same origin. Receivers replay the invalidation locally
 * without re-broadcasting (echo prevention via the `fromBroadcast` flag).
 */

const target = new EventTarget();
const EVENT = "invalidate";

// BroadcastChannel is undefined in older Safari (<15.4) and a few embedded
// webviews. Treat missing support as "single-tab only" and keep going.
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("uniconnect-cache")
    : null;

if (channel) {
  channel.onmessage = (event) => {
    const key = event?.data?.key;
    if (key) invalidate(key, { fromBroadcast: true });
  };
}

/** Subscribe to invalidation of `key`. Returns an unsubscribe function. */
export const onInvalidate = (key, callback) => {
  if (!key) return () => {};
  const handler = (e) => {
    if (e.detail?.key === key) callback();
  };
  target.addEventListener(EVENT, handler);
  return () => target.removeEventListener(EVENT, handler);
};

/**
 * Tell every hook subscribed to `key` to refetch — in this tab AND, when
 * possible, in other tabs of the same origin.
 *
 * The `fromBroadcast` flag is set by the BroadcastChannel receiver so we don't
 * re-broadcast inbound events back out (which would echo forever).
 */
export const invalidate = (key, { fromBroadcast = false } = {}) => {
  if (!key) return;
  target.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
  if (!fromBroadcast && channel) {
    channel.postMessage({ key });
  }
};
