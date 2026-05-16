import api from "../api/api";
import { useQuery } from "./useQuery";

/**
 * Backend returns `{ incoming, connected, sent }` from `/connections`.
 * Mutations (accept / reject / remove) patch the cache via `setData` since
 * each handler has the exact userId being moved between buckets.
 */
export const CONNECTIONS_KEY = "connections";

export function useConnections() {
  return useQuery(CONNECTIONS_KEY, () =>
    api.get("/connections").then((r) => r.data),
  );
}
