import api from "./api";

/** GET /api/notifications?unreadOnly=... */
export const getNotifications = ({ unreadOnly = false } = {}) =>
  api.get("/notifications", { params: { unreadOnly } });

/** PATCH /api/notifications/:id/read */
export const markRead = (id) => api.patch(`/notifications/${id}/read`);

/** PATCH /api/notifications/read-all */
export const markAllRead = () => api.patch("/notifications/read-all");
