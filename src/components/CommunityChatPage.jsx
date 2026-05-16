import { useEffect, useRef, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const CommunityChatPage = () => {
  const { communityId, channelId } = useParams();
  const { user } = useAuth();
  const { myRole } = useOutletContext();
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [channelType, setChannelType] = useState("text");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ================= FETCH MESSAGES ================= */
  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/channels/${channelId}/messages`);

        // 🔥 backend now returns { channelType, messages }
        setChannelType(res.data.channelType);
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [channelId]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socket || !channelId || !user) return;

    const joinRooms = () => {
      socket.emit("joinCommunity", communityId);
      socket.emit("joinChannel", channelId);
    };

    if (socket.connected) joinRooms();
    socket.on("connect", joinRooms);

    const handleReceive = (msg) => {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg],
      );
    };

    const handleTypingStart = ({ userId, name }) => {
      if (userId === user._id) return;

      setTypingUsers((prev) => {
        if (prev.some((u) => u.id === userId)) return prev;
        return [...prev, { id: userId, name }];
      });
    };

    const handleTypingStop = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("connect", joinRooms);
      socket.off("receiveMessage", handleReceive);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);

      if (socket.connected) {
        socket.emit("leaveChannel", channelId);
      }
    };
  }, [socket, channelId, communityId, user]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  /* ================= HANDLE TYPING ================= */
  const handleTyping = (value) => {
    setText(value);
    if (!socket) return;

    socket.emit("typing:start", {
      channelId,
      userId: user._id,
      name: user.name,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", {
        channelId,
        userId: user._id,
      });
    }, 1000);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await api.post(`/channels/${channelId}/messages`, {
        content: text,
      });

      // Trigger the server's room broadcast. Without this emit, the message
      // is persisted but the `channel:{id}` room never receives `receiveMessage`,
      // so the sender (and other tabs) only see the message after a reload.
      // Mirrors DMChatPage's `sendDM` emit pattern.
      const messageId = res.data?.message?._id;
      if (socket && messageId) {
        socket.emit("sendMessage", { messageId, channelId });
      }

      // Also stop any lingering typing indicator immediately.
      if (socket) {
        socket.emit("typing:stop", { channelId, userId: user._id });
      }

      setText("");
    } catch (err) {
      /* api interceptor surfaces the toast (e.g. "You are muted in this community") */
      console.error("Send failed:", err);
    }
  };

  const isAnnouncementReadOnly =
    channelType === "announcement" && !["admin", "owner"].includes(myRole);
  /* ================= RENDER ================= */
  return (
    <>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <h3 className="font-semibold text-lg">
          {channelType === "announcement"
            ? "📢 Announcement Channel"
            : "💬 Channel Chat"}
        </h3>

        {typingUsers.length > 0 && (
          <p
            className="text-xs mt-1 animate-pulse"
            style={{ color: "var(--pl-accent-hover)" }}
          >
            {typingUsers.map((u) => u.name).join(", ")} typing...
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {loading ? (
          <p className="text-slate-500">Loading messages...</p>
        ) : (
          messages.map((msg) => {
            const isMe =
              msg.senderId?._id === user._id || msg.senderId === user._id;

            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-neutral-900 text-white rounded-br-sm"
                      : "bg-white text-slate-800 rounded-bl-sm border border-neutral-200"
                  }`}
                >
                  {!isMe && (
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: "var(--pl-accent-hover)" }}
                    >
                      {msg.senderId?.name || "User"}
                    </p>
                  )}

                  <p>{msg.content}</p>

                  <div className="text-[10px] mt-1 opacity-70 text-right">
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex flex-col gap-2">
        {isAnnouncementReadOnly && (
          <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
            Only admins can post in this announcement channel.
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={
              isAnnouncementReadOnly ? "Read-only channel" : "Type a message..."
            }
            disabled={isAnnouncementReadOnly}
            className={`flex-1 px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition ${
              isAnnouncementReadOnly ? "bg-slate-100 cursor-not-allowed" : ""
            }`}
          />

          <button
            onClick={sendMessage}
            disabled={isAnnouncementReadOnly}
            className={`px-5 py-2 rounded-xl transition ${
              isAnnouncementReadOnly
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default CommunityChatPage;
