import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { notifyXp, refreshXp } from "./XpToastHost";

/**
 * Maintains a global socket subscription on the user's personal room
 * (`user:{userId}`) and converts `xp:awarded` events into the in-app
 * toast + LevelBadge refresh.
 *
 * Behavior:
 *   - Level-up events → big celebratory toast
 *   - Routine XP gains → silently bump the LevelBadge (no toast spam)
 *
 * Mount once at the App root after AuthProvider. Renders nothing.
 */
const XpSocket = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
    );
    socket.on("connect", () => socket.emit("joinUser", user._id));

    socket.on("xp:awarded", ({ newLevel, xpAwarded }) => {
      // Always update the LevelBadge so the bar fills smoothly.
      refreshXp();

      // Only celebrate level-ups. Routine XP from messages/actions stays silent.
      if (newLevel) {
        notifyXp({
          title: `Level ${newLevel} unlocked`,
          subtitle: xpAwarded
            ? `+${xpAwarded} XP — keep going.`
            : "Nice work — keep it up.",
          kind: "levelup",
          durationMs: 5000,
        });
      }
    });

    return () => {
      socket.off("xp:awarded");
      socket.disconnect();
    };
  }, [user?._id]);

  return null;
};

export default XpSocket;
