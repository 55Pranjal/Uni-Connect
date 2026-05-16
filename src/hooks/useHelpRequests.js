import { getHelpRequestsByChannel } from "../api/helpRequests";
import { useQuery } from "./useQuery";

/**
 * Help requests for a single channel.
 *
 * Socket events (`helpRequest:created`, `helpRequest:updated`) update the
 * cache directly via `setData` in ChannelPage — no refetch needed. Mutations
 * (create / claim / resolve) also use `setData` since they already have the
 * fresh entity in the response. Use `invalidate(helpRequestsKey(channelId))`
 * only if you suspect drift.
 */
export const helpRequestsKey = (channelId) =>
  channelId ? `helpRequests:${channelId}` : null;

export function useHelpRequests(channelId) {
  return useQuery(helpRequestsKey(channelId), () =>
    getHelpRequestsByChannel(channelId).then((r) => r.data.helpRequests),
  );
}
