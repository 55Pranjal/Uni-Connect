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
  const [paused, setPaused] = useState(
    typeof document !== "undefined" ? document.hidden : false,
  );
  const nextId = useRef(0);
  // id -> { dismissTimer, removeTimer, startedAt, elapsed, duration }
  const timers = useRef(new Map());

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
    slot.dismissTimer = null;
    timers.current.set(id, slot);
  }, []);

  // Helper: start (or restart) the dismiss timer for a toast with whatever
  // time it has remaining. Only called when the page is visible.
  const armDismiss = useCallback(
    (id) => {
      const slot = timers.current.get(id);
      if (!slot || slot.dismissTimer) return;
      const remaining = Math.max(0, (slot.duration ?? 0) - (slot.elapsed ?? 0));
      slot.startedAt = Date.now();
      slot.dismissTimer = setTimeout(() => startDismiss(id), remaining);
      timers.current.set(id, slot);
    },
    [startDismiss],
  );

  // Helper: stop the dismiss timer and bank its elapsed time. Called when the
  // page becomes hidden (so a toast that arrived while the user was away
  // doesn't quietly time out before they look at it).
  const disarmDismiss = useCallback((id) => {
    const slot = timers.current.get(id);
    if (!slot?.dismissTimer) return;
    clearTimeout(slot.dismissTimer);
    slot.dismissTimer = null;
    if (slot.startedAt) {
      slot.elapsed = (slot.elapsed ?? 0) + (Date.now() - slot.startedAt);
      slot.startedAt = null;
    }
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
        // Cap visible: dismiss the oldest if we'd exceed MAX_VISIBLE.
        if (next.length > MAX_VISIBLE) {
          const overflow = next.slice(0, next.length - MAX_VISIBLE);
          overflow.forEach((t) => startDismiss(t.id));
        }
        return next;
      });

      // Register the timer slot, but only arm the dismiss when visible.
      // If the user is on another tab, the timer stays disarmed until they
      // return — the toast greets them when they look, not before.
      timers.current.set(id, {
        dismissTimer: null,
        startedAt: null,
        elapsed: 0,
        duration,
      });
      if (!document.hidden) armDismiss(id);
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
  }, [startDismiss, armDismiss]);

  // Page Visibility: pause active dismiss timers when hidden, resume on return.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setPaused(true);
        timers.current.forEach((_slot, id) => disarmDismiss(id));
      } else {
        setPaused(false);
        timers.current.forEach((slot, id) => {
          if (!slot.removeTimer) armDismiss(id);
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [armDismiss, disarmDismiss]);

  const dismissNow = (id) => {
    const slot = timers.current.get(id);
    if (slot?.dismissTimer) clearTimeout(slot.dismissTimer);
    startDismiss(id);
  };

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className={`pl-toast-host fixed z-[100] flex flex-col-reverse gap-3 pointer-events-none bottom-4 inset-x-4 sm:bottom-5 sm:left-auto sm:right-5 sm:w-auto sm:max-w-sm${
        paused ? " is-paused" : ""
      }`}
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
