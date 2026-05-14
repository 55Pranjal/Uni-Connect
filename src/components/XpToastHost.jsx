import { useEffect, useState, useRef } from "react";

/**
 * Renders transient XP / level-up toasts. Listens for window events:
 *
 *   window.dispatchEvent(new CustomEvent("xp:notify", {
 *     detail: { message, kind?: "levelup" | "xp", durationMs?: 4000 }
 *   }))
 *
 * Mount once at the App root. Pairs with `LevelBadge` which listens for
 * `xp:refresh` separately.
 */
const XpToastHost = () => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  useEffect(() => {
    const handler = (e) => {
      const { message, kind = "xp", durationMs = 4000 } = e.detail ?? {};
      if (!message) return;
      const id = ++nextId.current;
      setToasts((t) => [...t, { id, message, kind }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, durationMs);
    };
    window.addEventListener("xp:notify", handler);
    return () => window.removeEventListener("xp:notify", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-[slideIn_.25s_ease-out] ${
            t.kind === "levelup"
              ? "bg-neutral-900 text-white border-transparent"
              : "bg-white text-slate-800 border-slate-200"
          }`}
        >
          {t.kind === "levelup" && <span className="mr-2">🎉</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
};

/** Helper for callers — avoids stringifying CustomEvent setup at every site. */
export const notifyXp = (message, opts = {}) => {
  window.dispatchEvent(
    new CustomEvent("xp:notify", { detail: { message, ...opts } })
  );
};

/** Triggers all subscribed `LevelBadge` instances to refetch. */
export const refreshXp = () => {
  window.dispatchEvent(new CustomEvent("xp:refresh"));
};

export default XpToastHost;
