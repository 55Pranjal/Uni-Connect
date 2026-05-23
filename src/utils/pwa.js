import { subscribeToPush, unsubscribeFromPush } from "../api/push";

/**
 * Web Push setup helpers.
 *
 * Browser support gates:
 *   - "Notification" in window      → permission API
 *   - "serviceWorker" in navigator  → registration + pushManager
 *
 * iOS Safari only fires push for INSTALLED PWAs (Add to Home Screen). Chrome
 * and Firefox on Android work pre-install. We don't try to detect "is
 * installed" — we just attempt and surface the actual failure to the user.
 */

/**
 * VAPID conversion: the server's application key is a base64url string, but
 * the PushManager API requires a Uint8Array. Canonical 8-liner.
 */
export const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
};

const isSupported = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

/**
 * Request permission, subscribe via the PushManager, and POST the
 * subscription to the backend. Returns:
 *   { ok: true }
 *   { ok: false, reason: "unsupported" | "denied" | "no-vapid" | "no-registration" | "subscribe-failed" }
 */
export async function enablePushNotifications() {
  if (!isSupported()) return { ok: false, reason: "unsupported" };

  const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapid) return { ok: false, reason: "no-vapid" };

  if (Notification.permission === "denied") {
    return { ok: false, reason: "denied" };
  }
  if (Notification.permission !== "granted") {
    const result = await Notification.requestPermission();
    if (result !== "granted") return { ok: false, reason: "denied" };
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return { ok: false, reason: "no-registration" };

  try {
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
    }
    await subscribeToPush(subscription.toJSON(), navigator.userAgent);
    return { ok: true };
  } catch (err) {
    console.error("enablePushNotifications failed:", err);
    return { ok: false, reason: "subscribe-failed" };
  }
}

/**
 * Drop the current subscription on the client and tell the backend to forget
 * the endpoint. Idempotent — calling when nothing is subscribed is a no-op.
 */
export async function disablePushNotifications() {
  if (!isSupported()) return { ok: false, reason: "unsupported" };

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return { ok: true };

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return { ok: true };

  const endpoint = subscription.endpoint;
  try {
    await subscription.unsubscribe();
  } catch {
    /* fall through — still tell the backend, the user wants out */
  }
  try {
    await unsubscribeFromPush(endpoint);
  } catch {
    /* api interceptor surfaces the toast; subscription is already gone client-side */
  }
  return { ok: true };
}

/**
 * Read-only state probe for the UI. Returns "unsupported" | "denied" |
 * "granted" | "default".
 */
export const getPushPermissionState = () => {
  if (!isSupported()) return "unsupported";
  return Notification.permission;
};
