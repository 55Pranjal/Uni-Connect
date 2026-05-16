import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

/**
 * Single shared socket.io connection for the entire frontend.
 *
 * To wire this in, App.jsx should wrap the route tree like:
 *   import { SocketProvider } from "./context/SocketContext.jsx";
 *
 *   <SocketProvider>
 *     <Routes>...</Routes>
 *     <XpToastHost />
 *     <XpSocket />
 *   </SocketProvider>
 *
 * Place <SocketProvider> *inside* <AuthProvider> (it depends on useAuth) and
 * around any component that calls useSocket() — XpSocket, CommunityChatPage,
 * DMChatPage all rely on it.
 *
 * Consumers:
 *   const socket = useSocket();
 *   if (!socket) return; // null while connecting or unauthenticated
 *
 *   useSocketRoom(channelId, "joinChannel", "leaveChannel");
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?._id) return;

    const instance = io(BACKEND_URL, {
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionDelay: 1000,
    });

    instance.on("connect", () => {
      instance.emit("joinUser", user._id);
    });

    setSocket(instance);

    return () => {
      instance.removeAllListeners();
      instance.disconnect();
      setSocket(null);
    };
  }, [user?._id, token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

/**
 * Join `roomName` on mount (and on reconnect), leave on unmount.
 * Pass the event names the backend expects, e.g.
 *   useSocketRoom(channelId, "joinChannel", "leaveChannel");
 *
 * Pass a falsy `roomName` to skip (useful while params/auth are still loading).
 */
export const useSocketRoom = (roomName, joinEvent, leaveEvent) => {
  const socket = useSocket();
  const joinedRef = useRef(null);

  useEffect(() => {
    if (!socket || !roomName || !joinEvent) return;

    const join = () => socket.emit(joinEvent, roomName);

    if (socket.connected) join();
    socket.on("connect", join);
    joinedRef.current = roomName;

    return () => {
      socket.off("connect", join);
      if (leaveEvent && socket.connected) {
        socket.emit(leaveEvent, roomName);
      }
      joinedRef.current = null;
    };
  }, [socket, roomName, joinEvent, leaveEvent]);
};
