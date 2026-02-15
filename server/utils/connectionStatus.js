/**
 * Returns connection status between currentUser and otherUserId
 * - "none"              → no connection exists
 * - "pending_sent"      → current user has sent the request
 * - "pending_received"  → current user has received a request
 * - "connected"         → both accepted
 */
export const getConnectionStatus = (currentUser, otherUserId) => {
  if (!currentUser?.connections || !Array.isArray(currentUser.connections)) {
    return "none";
  }

  const connection = currentUser.connections.find(
    (c) => c.user.toString() === otherUserId
  );

  if (!connection) return "none";

  if (connection.status === "accepted") return "connected";

  if (connection.status === "pending") {
    // if current user initiated the pending request
    if (
      connection.initiatedBy &&
      connection.initiatedBy.toString() === currentUser._id.toString()
    ) {
      return "pending_sent";
    }
    // otherwise current user received the pending request
    return "pending_received";
  }

  return "none";
};
