import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { notifyXp } from "../components/XpToastHost";

/**
 * Unified UX primitives: in-app toasts (replaces alert()) and an async confirm
 * dialog (replaces window.confirm()).
 *
 * Usage:
 *   const { notify, confirm } = useToast();
 *
 *   // Toast: string shortcut, or full payload
 *   notify("Saved.");
 *   notify({
 *     title: "Failed to save",
 *     subtitle: err.message,
 *     severity: "error",   // "info" | "success" | "error" | "levelup"
 *     durationMs: 6000,    // optional
 *   });
 *
 *   // Async confirm — returns Promise<boolean>
 *   const ok = await confirm({
 *     title: "Remove this connection?",
 *     message: "You can reconnect later.",
 *     confirmText: "Remove",
 *     danger: true,
 *   });
 *   if (ok) onRemove();
 *
 * Under the hood, `notify` reuses the existing XpToastHost queue (same
 * window-event bus), so styling and animations match the level-up toasts.
 * Non-"levelup" severities all render with the default toast style today;
 * the severity is preserved on the event detail so we can color-code later
 * without touching call sites.
 */

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState(null);

  const notify = useCallback((payload) => {
    if (payload == null) return;
    if (typeof payload === "string") {
      notifyXp({ title: payload });
      return;
    }
    const { title, subtitle, severity, durationMs, kind } = payload;
    if (!title) return;
    notifyXp({
      title,
      subtitle,
      // `kind` is what XpToastHost reads for visual variant; map severity → kind.
      // Today only "levelup" has a distinct style; the rest fall through to default.
      kind: kind ?? (severity === "levelup" ? "levelup" : undefined),
      severity,
      durationMs,
    });
  }, []);

  const confirm = useCallback(
    ({
      title,
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
      danger = false,
    }) =>
      new Promise((resolve) => {
        setConfirmState({
          title,
          message,
          confirmText,
          cancelText,
          danger,
          resolve,
        });
      }),
    []
  );

  const settle = (result) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  // Expose notify/confirm to non-React callers (e.g. axios interceptors).
  useEffect(() => {
    toastBridge.notify = notify;
    toastBridge.confirm = confirm;
    return () => {
      toastBridge.notify = noopNotify;
      toastBridge.confirm = noopConfirm;
    };
  }, [notify, confirm]);

  return (
    <ToastContext.Provider value={{ notify, confirm }}>
      {children}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          danger={confirmState.danger}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
};

/**
 * Module-scope bridge for non-React callers (axios interceptors, etc.).
 * Populated by ToastProvider on mount; falls back to no-ops before mount.
 */
const noopNotify = () => {};
const noopConfirm = () => Promise.resolve(false);
export const toastBridge = {
  notify: noopNotify,
  confirm: noopConfirm,
};

const ConfirmDialog = ({
  title,
  message,
  confirmText,
  cancelText,
  danger,
  onConfirm,
  onCancel,
}) => (
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={onCancel}
  >
    <div
      role="dialog"
      aria-modal="true"
      className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full mx-4 p-6"
      onClick={(e) => e.stopPropagation()}
    >
      {title && (
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      )}
      {message && <p className="text-sm text-slate-600 mb-6">{message}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg text-white ${
            danger
              ? "bg-red-600 hover:bg-red-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

