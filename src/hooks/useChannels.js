import api from "../api/api";
import { useQuery } from "./useQuery";

/**
 * Backend returns the full community bundle from `/community/:id`:
 *   { community, channels, myRole }
 *
 * That single fetch drives the ChannelPage sidebar + role gates, so the hook
 * returns it as-is.
 */
export const communityKey = (communityId) =>
  communityId ? `community:${communityId}` : null;

export function useCommunity(communityId) {
  return useQuery(communityKey(communityId), () =>
    api.get(`/community/${communityId}`).then((r) => r.data),
  );
}
