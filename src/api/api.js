import axios from "axios";
import { toastBridge } from "../context/ToastContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  // Auth now rides on an httpOnly cookie issued by the backend; axios needs
  // withCredentials so the browser actually attaches it on cross-origin calls.
  withCredentials: true,
});

/**
 * Surface server errors as toasts globally. Callers can opt out per-request by
 * setting `config.suppressToast = true` (useful for routes that handle errors
 * inline, e.g. login forms that show field-level errors).
 *
 * Two response shapes are supported:
 *   - Central error envelope: { error: { code, message, details? } }
 *     Used by the new errorHandler for validation failures, 404s, 5xx.
 *   - Legacy plain: { message }
 *     Still emitted by some business-logic 400s (e.g. "User already exists").
 *
 * The original error is still rejected so existing try/catch logic keeps
 * working — this only ADDS a default UI surface.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const suppressed = err?.config?.suppressToast;
    const status = err?.response?.status;
    // Don't toast on 401 — auth flows redirect to /login and a toast adds noise.
    if (!suppressed && status !== 401) {
      const data = err?.response?.data;
      const serverMsg = data?.error?.message ?? data?.message;
      const fallback =
        status >= 500
          ? "Server error — please try again."
          : status
          ? "Request failed."
          : "Network error — check your connection.";

      // For validation failures, pull the first issue out of details so the
      // toast actually points at the field that broke (e.g. "email: Invalid").
      let subtitle;
      const firstIssue = data?.error?.details?.[0];
      if (firstIssue?.message) {
        const path = Array.isArray(firstIssue.path)
          ? firstIssue.path.join(".")
          : "";
        subtitle = path ? `${path}: ${firstIssue.message}` : firstIssue.message;
      }

      toastBridge.notify({
        title: serverMsg || fallback,
        ...(subtitle ? { subtitle } : {}),
        severity: "error",
      });
    }
    return Promise.reject(err);
  }
);

export default api;
