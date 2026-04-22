import api from "./api";

/** POST /api/help-requests */
export const createHelpRequest = (data) => api.post("/help-requests", data);

/** GET /api/help-requests/channel/:channelId */
export const getHelpRequestsByChannel = (channelId, params = {}) =>
  api.get(`/help-requests/channel/${channelId}`, { params });

/** PATCH /api/help-requests/:id/claim */
export const claimHelpRequest = (id) => api.patch(`/help-requests/${id}/claim`);

/** PATCH /api/help-requests/:id/resolve */
export const resolveHelpRequest = (id, data = {}) =>
  api.patch(`/help-requests/${id}/resolve`, data);
