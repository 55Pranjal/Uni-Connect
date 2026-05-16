import api from "../api/api";
import { useQuery } from "./useQuery";

/**
 * The user's joined communities.
 *
 * Invalidate via:
 *   invalidate(MY_COMMUNITIES_KEY)
 * after creating, joining, leaving, or deleting a community.
 */
export const MY_COMMUNITIES_KEY = "communities:my";

export function useMyCommunities() {
  return useQuery(MY_COMMUNITIES_KEY, () =>
    api.get("/community/my").then((r) => r.data),
  );
}
