import api from "./api";

/** POST /api/push/subscribe — register a Web Push subscription server-side. */
export const subscribeToPush = (subscription, userAgent) =>
  api.post("/push/subscribe", { subscription, userAgent });

/** DELETE /api/push/subscribe — drop the subscription identified by endpoint. */
export const unsubscribeFromPush = (endpoint) =>
  api.delete("/push/subscribe", { data: { endpoint } });
