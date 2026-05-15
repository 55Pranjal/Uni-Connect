import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Renders transient XP / level-up toasts. Listens for window events:
 *
 *   window.dispatchEvent(new CustomEvent("xp:notify", {
 *     detail: {
 *       title: string,
 *       subtitle?: string,
 *       kind?: "levelup" | "xp",
 *       durationMs?: number,
 *     }
 *   }))
 *
 * Backwards-compatible: `detail` may be a plain string (used as title) or
 * `{ message }`.
 *
 * Mount once at the App root. Pairs with `LevelBadge` which listens for
 * `xp:refresh` separately.
 */

const MAX_VISIBLE = 3;
const LEAVE_MS = 320; // matches `.pl-toast.is-leaving` animation
const DEFAULT_DURATION = 4500;

const XpToastHost = () => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Map()); // id -> { dismissTimer, removeTimer }

  const startDismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, LEAVE_MS);
    const slot = timers.current.get(id) || {};
    slot.removeTimer = removeTimer;
    timers.current.set(id, slot);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail ?? {};
      let title, subtitle, kind, durationMs;

      // Accept string, { message, ... }, or { title, subtitle, ... }
      if (typeof detail === "string") {
        title = detail;
      } else {
        title = detail.title ?? detail.message;
        subtitle = detail.subtitle;
        kind = detail.kind;
        durationMs = detail.durationMs;
      }
      if (!title) return;

      const id = ++nextId.current;
      const duration = durationMs ?? DEFAULT_DURATION;

      setToasts((prev) => {
        const next = [...prev, { id, title, subtitle, kind, duration, leaving: false }];
        // Cap visible: queue extras by leaving in place but the dismiss
        // logic below pushes earliest entries out first.
        if (next.length > MAX_VISIBLE) {
          const overflow = next.slice(0, next.length - MAX_VISIBLE);
          overflow.forEach((t) => startDismiss(t.id));
        }
        return next;
      });

      const dismissTimer = setTimeout(() => startDismiss(id), duration);
      timers.current.set(id, { dismissTimer });
    };

    window.addEventListener("xp:notify", handler);
    return () => {
      window.removeEventListener("xp:notify", handler);
      timers.current.forEach(({ dismissTimer, removeTimer }) => {
        clearTimeout(dismissTimer);
        clearTimeout(removeTimer);
      });
      timers.current.clear();
    };
  }, [startDismiss]);

  const dismissNow = (id) => {
    const slot = timers.current.get(id);
    if (slot?.dismissTimer) clearTimeout(slot.dismissTimer);
    startDismiss(id);
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col-reverse gap-3 pointer-events-none"
      style={{ left: "auto" }}
    >
      {toasts.map((t) => (
        <Toast
          key={t.id}
          toast={t}
          onDismiss={() => dismissNow(t.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ toast, onDismiss }) => {
  const isLevelUp = toast.kind === "levelup";
  return (
    <div
      role="status"
      className={`pl-toast pointer-events-auto ${
        isLevelUp ? "pl-toast--levelup" : ""
      } ${toast.leaving ? "is-leaving" : ""}`}
      onClick={onDismiss}
    >
      <span className="pl-toast-icon" aria-hidden>
        {isLevelUp ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l2.4 5.4L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.6-1.6L12 2z" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
          </svg>
        )}
      </span>

      <div className="pl-toast-body">
        <p className="pl-toast-title">{toast.title}</p>
        {toast.subtitle && <p className="pl-toast-sub">{toast.subtitle}</p>}
      </div>

      <button
        type="button"
        aria-label="Dismiss"
        className="pl-toast-close"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <span
        className="pl-toast-progress"
        style={{ animationDuration: `${toast.duration}ms`, width: "100%" }}
      />
    </div>
  );
};

/** Helper for callers — supports either a string or a payload object. */
export const notifyXp = (titleOrPayload, opts = {}) => {
  const detail =
    typeof titleOrPayload === "string"
      ? { title: titleOrPayload, ...opts }
      : titleOrPayload;
  window.dispatchEvent(new CustomEvent("xp:notify", { detail }));
};

/** Triggers all subscribed `LevelBadge` instances to refetch. */
export const refreshXp = () => {
  window.dispatchEvent(new CustomEvent("xp:refresh"));
};

export default XpToastHost;
