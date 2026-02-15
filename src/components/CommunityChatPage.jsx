import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const CommunityChatPage = () => {
  const { communityId, channelId } = useParams();
  const { user, token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ================= FETCH MESSAGES ================= */
  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/channels/${channelId}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [channelId]);

  /* ================= SOCKET CONNECTION ================= */
  useEffect(() => {
    if (!channelId || !user) return;

    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinCommunity", communityId);
      socket.emit("joinChannel", channelId);
    });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg],
      );
    });

    socket.on("typing:start", ({ userId, name }) => {
      if (userId === user._id) return;

      setTypingUsers((prev) => {
        if (prev.some((u) => u.id === userId)) return prev;
        return [...prev, { id: userId, name }];
      });
    });

    socket.on("typing:stop", ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
    });

    return () => {
      socket.disconnect();
    };
  }, [channelId, communityId, user]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typingUsers]);

  /* ================= HANDLE TYPING ================= */
  const handleTyping = (value) => {
    setText(value);

    if (!socketRef.current) return;

    socketRef.current.emit("typing:start", {
      channelId,
      userId: user._id,
      name: user.name,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("typing:stop", {
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

      socketRef.current.emit("sendMessage", {
        messageId: res.data._id,
        channelId,
      });

      setText("");

      socketRef.current.emit("typing:stop", {
        channelId,
        userId: user._id,
      });
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* Channel Header */}
      <div className="px-6 py-4 border-b bg-white">
        <h3 className="font-semibold text-lg">Channel Chat</h3>

        {typingUsers.length > 0 && (
          <p className="text-xs text-indigo-600 mt-1 animate-pulse">
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
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-semibold text-indigo-600 mb-1">
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
      <div className="p-4 border-t bg-white flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={sendMessage}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </div>
    </>
  );
};

export default CommunityChatPage;
