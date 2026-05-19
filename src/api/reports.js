import api from "./api";

/** POST /api/reports — create a new user-submitted report. */
export const createReport = (data) => api.post("/reports", data);

/** GET /api/community/:id/reports?status=open|resolved|dismissed */
export const getCommunityReports = (communityId, params = {}) =>
  api.get(`/community/${communityId}/reports`, { params });

/** PATCH /api/reports/:id — moderator updates status / adds a note. */
export const updateReport = (reportId, data) =>
  api.patch(`/reports/${reportId}`, data);

/** GET /api/community/:id/audit-log?limit=N — read-only moderation feed. */
export const getCommunityAuditLog = (communityId, { limit = 100 } = {}) =>
  api.get(`/community/${communityId}/audit-log`, { params: { limit } });
