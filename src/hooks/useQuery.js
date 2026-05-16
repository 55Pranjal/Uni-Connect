import { useCallback, useEffect, useState } from "react";
import { onInvalidate } from "../lib/queryEvents";

/**
 * Minimal data-fetching hook. Wraps the useEffect + axios + setLoading dance
 * every page in this codebase used to repeat by hand.
 *
 * Pass a `key` (string) that uniquely identifies the data. Pass `null`/falsy
 * to opt out (useful while params are still loading, e.g. before a route
 * param resolves). When `invalidate(key)` is called anywhere in the app, this
 * hook refetches.
 *
 * @template T
 * @param {string|null} key       Cache key. Falsy → no fetch.
 * @param {() => Promise<T>} fetcher  Async function returning the data.
 * @returns {{
 *   data: T|null,
 *   error: any,
 *   loading: boolean,
 *   refetch: () => void,
 *   setData: (updater: T | ((prev: T) => T)) => void,
 * }}
 *
 * Notes:
 *   - The fetcher is wrapped in a cancel guard, so stale fetches (e.g. after
 *     the key changes mid-request) won't overwrite fresh data.
 *   - `loading` is true on the initial fetch; subsequent invalidate-driven
 *     refetches set it back to true so consumers can show a spinner if they
 *     want. If you want "stale-while-revalidate" UX, just keep rendering
 *     `data` while `loading` is true — it'll still be the previous snapshot
 *     until the new fetch resolves.
 *   - `setData` is exposed so consumers with richer info (socket events,
 *     optimistic updates) can patch the cache directly without a refetch.
 *     Same shape as React's setState — accepts a value or an updater fn.
 *   - No caching across hooks: two components with the same key each fire
 *     their own request. Good enough for this codebase; revisit if needed.
 */
export function useQuery(key, fetcher) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(key));

  const refetch = useCallback(() => {
    if (!key) {
      setLoading(false);
      return () => {};
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // We intentionally do NOT depend on `fetcher` — callers usually inline an
    // arrow function, which would change every render. Key is the contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const cancel = refetch();
    return cancel;
  }, [refetch]);

  useEffect(() => onInvalidate(key, refetch), [key, refetch]);

  return { data, error, loading, refetch, setData };
}
