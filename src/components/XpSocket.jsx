import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { notifyXp, refreshXp } from "./XpToastHost";

/**
 * Subscribes to `xp:awarded` on the shared socket and converts the events
 * into LevelBadge refreshes + toasts.
 *
 * Toast policy:
 *   - Level-up        → big celebratory toast (highest priority)
 *   - Notable events  → toast acknowledging the action (HELP_REQUEST_RESOLVED,
 *                       PROJECT_COLLABORATION — rare, meaningful)
 *   - Routine events  → silent badge bump only (DM_SENT, SKILL_VALIDATED,
 *                       COMMUNITY_MESSAGE — frequent, would be spam)
 *
 * Mount once at the App root inside <SocketProvider>. Renders nothing.
 */

const NOTABLE_EVENTS = {
  HELP_REQUEST_RESOLVED: {
    title: "Thanks for helping!",
    durationMs: 4500,
  },
  PROJECT_COLLABORATION: {
    title: "You're in — collaboration accepted",
    durationMs: 4500,
  },
};

const XpSocket = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleXp = ({ eventType, newLevel, xpAwarded }) => {
      // Always update the LevelBadge so the progress bar reflects the new XP.
      refreshXp();

      // Level-up takes precedence — celebrate it.
      if (newLevel) {
        notifyXp({
          title: `Level ${newLevel} unlocked`,
          subtitle: xpAwarded
            ? `+${xpAwarded} XP — keep going.`
            : "Nice work — keep it up.",
          kind: "levelup",
          durationMs: 5000,
        });
        return;
      }

      // No level-up, but the event itself is notable → smaller toast.
      const notable = NOTABLE_EVENTS[eventType];
      if (notable) {
        notifyXp({
          title: notable.title,
          subtitle: xpAwarded ? `+${xpAwarded} XP earned.` : undefined,
          durationMs: notable.durationMs,
        });
      }
    };

    socket.on("xp:awarded", handleXp);

    return () => {
      socket.off("xp:awarded", handleXp);
    };
  }, [socket]);

  return null;
};

export default XpSocket;
