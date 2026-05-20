import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getAvatarUrl } from "../utils/avatar";
import { getNotifications, markRead, markAllRead } from "../api/notifications";

/**
 * In-app notification surface. Lives in the Navbar next to LevelBadge.
 *
 * - Self-fetches once on mount (gated on isAuthenticated, same pattern as
 *   LevelBadge), then relies on the shared socket's "notification:new" event
 *   for live updates.
 * - Mark-read calls are optimistic; on failure we refetch to resync.
 */

const MAX_LIST = 50;

const formatRelative = (value) => {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(value).toLocaleDateString();
};

const sentenceFor = (n) => {
  const name = n.actor?.name || "Someone";
  switch (n.type) {
    case "connection.accepted":
      return `${name} accepted your connection request`;
    case "helprequest.helpful":
      return `${name} marked your reply as helpful`;
    case "report.resolved":
      return "Your report was resolved";
    case "report.dismissed":
      return "Your report was dismissed";
    default:
      return `${name} sent you an update`;
  }
};

const hrefFor = (n) => {
  switch (n.type) {
    case "connection.accepted":
      return n.actor?._id ? `/public/${n.actor._id}` : null;
    case "helprequest.helpful":
      // Per spec: targetId is the channel where the help request lives.
      // Confirm with backend if the payload uses a different field.
      return n.communityId && n.targetId
        ? `/community/${n.communityId}/channel/${n.targetId}`
        : null;
    case "report.resolved":
    case "report.dismissed":
      return n.communityId ? `/community/${n.communityId}/moderation` : null;
    default:
      return null;
  }
};

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapperRef = useRef(null);

  const refetch = useCallback(async () => {
    try {
      const res = await getNotifications();
      const list = res.data?.notifications ?? [];
      setItems(list.slice(0, MAX_LIST));
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch {
      /* api interceptor surfaces the toast */
    }
  }, []);

  /* Fetch once on mount when authed. */
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    refetch();
  }, [isAuthenticated, refetch]);

  /* Live updates over the shared socket. */
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNew = (notification) => {
      if (!notification?._id) return;
      setItems((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev].slice(0, MAX_LIST);
      });
      if (!notification.read) {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on("notification:new", handleNew);
    return () => socket.off("notification:new", handleNew);
  }, [socket, isAuthenticated]);

  /* Click-outside + Escape to close. */
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!isAuthenticated) return null;

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    const snapshot = items;
    const prevCount = unreadCount;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllRead();
    } catch {
      setItems(snapshot);
      setUnreadCount(prevCount);
      refetch();
    }
  };

  const handleRowClick = async (n) => {
    setOpen(false);
    const target = hrefFor(n);

    if (!n.read) {
      setItems((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      markRead(n._id).catch(() => refetch());
    }

    if (target) navigate(target);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg transition"
        style={{ color: "var(--pl-ink-2)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--pl-surface)";
          e.currentTarget.style.color = "var(--pl-ink)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--pl-ink-2)";
        }}
      >
        <svg
          className="w-[18px] h-[18px]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.7}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.17V11a6 6 0 10-12 0v3.17a2 2 0 01-.6 1.43L4 17h5m6 0a3 3 0 11-6 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 inline-flex items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ background: "var(--pl-accent)" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">
              Notifications
            </span>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-slate-500 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Mark all read
            </button>
          </div>

          <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {items.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-slate-400">
                No notifications yet.
              </li>
            ) : (
              items.map((n) => (
                <li key={n._id}>
                  <button
                    type="button"
                    onClick={() => handleRowClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      n.read ? "" : "bg-orange-50/40"
                    }`}
                  >
                    <img
                      src={getAvatarUrl(
                        n.actor?.avatarSeed || n.actor?._id || "system"
                      )}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                      style={{ background: "var(--pl-surface)" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 leading-snug">
                        {sentenceFor(n)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatRelative(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span
                        aria-label="Unread"
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: "var(--pl-accent)" }}
                      />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
