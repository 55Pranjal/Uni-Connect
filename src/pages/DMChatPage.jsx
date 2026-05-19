import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import ReportModal from "../components/modals/ReportModal";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const DMChatPage = () => {
  const { conversationId } = useParams();
  const { user, token, loading: authLoading } = useAuth();
  const socket = useSocket();

  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ================= FETCH DM MESSAGES ================= */
  useEffect(() => {
    if (authLoading) return;
    if (!conversationId || !token) return;

    setLoading(true);

    api
      .get(`/dm/${conversationId}/messages`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Fetch DM failed:", err))
      .finally(() => setLoading(false));
  }, [conversationId, token, authLoading]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (authLoading) return;
    if (!socket || !userId || !conversationId) return;

    const joinRoom = () => {
      setIsSocketReady(true);
      socket.emit("joinConversation", conversationId);
    };

    const handleDisconnect = () => setIsSocketReady(false);

    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    socket.on("disconnect", handleDisconnect);

    /* ===== RECEIVE DM ===== */
    const handleReceiveDM = (msg) => {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    };

    /* ===== TYPING START ===== */
    const handleTypingStart = ({ userId: typingUserId, name }) => {
      if (typingUserId === userId) return;

      setTypingUsers((prev) => {
        if (prev.some((u) => u.id === typingUserId)) return prev;
        return [...prev, { id: typingUserId, name }];
      });
    };

    /* ===== TYPING STOP ===== */
    const handleTypingStop = ({ userId: typingUserId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== typingUserId));
    };

    socket.on("receiveDM", handleReceiveDM);
    socket.on("dm:typing:start", handleTypingStart);
    socket.on("dm:typing:stop", handleTypingStop);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("disconnect", handleDisconnect);
      socket.off("receiveDM", handleReceiveDM);
      socket.off("dm:typing:start", handleTypingStart);
      socket.off("dm:typing:stop", handleTypingStop);
      setIsSocketReady(false);
    };
  }, [socket, conversationId, userId, authLoading]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  /* ================= HANDLE TYPING ================= */
  const handleTyping = (value) => {
    setText(value);

    if (!socket || !isSocketReady) return;

    socket.emit("dm:typing:start", {
      conversationId,
      userId,
      name: user.name,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (!socket) return;

      socket.emit("dm:typing:stop", {
        conversationId,
        userId,
      });
    }, 1000);
  };

  /* ================= SEND DM ================= */
  const sendMessage = async () => {
    if (!text.trim()) return;
    if (!isSocketReady) return;

    try {
      await api.post(`/dm/${conversationId}/messages`, {
        content: text,
      });

      // Server broadcasts the DM to `conversation:{id}` from POST /dm.

      setText("");

      socket.emit("dm:typing:stop", {
        conversationId,
        userId,
      });
    } catch (err) {
      console.error("Send DM failed:", err);
    }
  };

  const typingNames = typingUsers.map((u) => u.name);

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-6">
        {authLoading || loading ? (
          <div className="text-center text-slate-500">Loading...</div>
        ) : (
          <div className="h-[75vh] flex flex-col bg-white border rounded-2xl shadow-sm overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-4 border-b bg-slate-50">
              <h3 className="font-semibold">Direct Message</h3>

              {typingNames.length > 0 && (
                <p
                  className="text-xs animate-pulse mt-1"
                  style={{ color: "var(--pl-accent-hover)" }}
                >
                  {typingNames.join(", ")} typing...
                </p>
              )}
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50">
              {messages.map((msg) => {
                const sender =
                  typeof msg.senderId === "object" ? msg.senderId : null;

                const senderIdValue =
                  typeof msg.senderId === "object"
                    ? msg.senderId._id
                    : msg.senderId;

                const isMe = senderIdValue?.toString() === userId?.toString();

                const senderName = sender?.name || "User";

                return (
                  <div
                    key={msg._id}
                    className={`group flex items-end gap-1.5 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
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
                          {senderName}
                        </p>
                      )}

                      <p>{msg.content}</p>

                      <div className="text-[10px] mt-1 opacity-70 text-right">
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>

                    {!isMe && (
                      <button
                        type="button"
                        onClick={() => setReportTarget(msg._id)}
                        aria-label="Report message"
                        title="Report message"
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition text-slate-400 hover:text-red-500 p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 4v16M4 4h12l-2 4 2 4H4"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="px-4 py-3 border-t flex gap-3">
              <input
                className="flex-1 rounded-xl border px-4 py-2 focus:ring-2 focus:ring-neutral-900"
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                disabled={!isSocketReady}
                className="px-5 py-2 bg-neutral-900 text-white rounded-xl disabled:opacity-50 hover:bg-neutral-800 transition"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </main>

      <ReportModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetType="message"
        targetId={reportTarget}
      />
    </>
  );
};

export default DMChatPage;
