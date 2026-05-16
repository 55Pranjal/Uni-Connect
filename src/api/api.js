import axios from "axios";
import { toastBridge } from "../context/ToastContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // if you use cookies
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Surface server errors as toasts globally. Callers can opt out per-request by
 * setting `config.suppressToast = true` (useful for routes that handle errors
 * inline, e.g. login forms that show field-level errors).
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
      const serverMsg = err?.response?.data?.message;
      const fallback =
        status >= 500
          ? "Server error — please try again."
          : status
          ? "Request failed."
          : "Network error — check your connection.";
      toastBridge.notify({
        title: serverMsg || fallback,
        severity: "error",
      });
    }
    return Promise.reject(err);
  }
);

export default api;
