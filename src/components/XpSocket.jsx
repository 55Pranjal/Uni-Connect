import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { notifyXp, refreshXp } from "./XpToastHost";

/**
 * Maintains a global socket subscription on the user's personal room
 * (`user:{userId}`) and converts incoming `xp:awarded` events into the
 * in-app toast + LevelBadge refresh.
 *
 * Mount once at the App root after AuthProvider. Renders nothing.
 */
const XpSocket = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");
    socket.on("connect", () => socket.emit("joinUser", user._id));

    socket.on("xp:awarded", ({ newLevel }) => {
      if (newLevel) {
        notifyXp(`You levelled up to Lv. ${newLevel}!`, { kind: "levelup" });
      } else {
        notifyXp("XP awarded — nice work.");
      }
      refreshXp();
    });

    return () => {
      socket.off("xp:awarded");
      socket.disconnect();
    };
  }, [user?._id]);

  return null;
};

export default XpSocket;
