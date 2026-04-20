import api from "./api";

/* ─────────────────────────────────────────────
   PROJECT CRUD
───────────────────────────────────────────── */

/** GET /api/projects?search=&tags=&status= */
export const getAllProjects = (params = {}) =>
  api.get("/projects", { params });

/** GET /api/projects/:id */
export const getProjectById = (projectId) =>
  api.get(`/projects/${projectId}`);

/** POST /api/projects  — create a new project */
export const createProject = (data) =>
  api.post("/projects", data);

/** PUT /api/projects/:id  — update your own project */
export const updateProject = (projectId, data) =>
  api.put(`/projects/${projectId}`, data);

/** DELETE /api/projects/:id  — delete your own project */
export const deleteProject = (projectId) =>
  api.delete(`/projects/${projectId}`);

/* ─────────────────────────────────────────────
   COLLABORATION REQUESTS
───────────────────────────────────────────── */

/** POST /api/projects/:id/collaborate  — send a collaboration request */
export const sendCollabRequest = (projectId) =>
  api.post(`/projects/${projectId}/collaborate`);

/** PUT /api/projects/:id/collaborate/:requestId/accept */
export const acceptCollabRequest = (projectId, requestId) =>
  api.put(`/projects/${projectId}/collaborate/${requestId}/accept`);

/** PUT /api/projects/:id/collaborate/:requestId/reject */
export const rejectCollabRequest = (projectId, requestId) =>
  api.put(`/projects/${projectId}/collaborate/${requestId}/reject`);

/** DELETE /api/projects/:id/collaborate/:requestId — withdraw your own request */
export const withdrawCollabRequest = (projectId, requestId) =>
  api.delete(`/projects/${projectId}/collaborate/${requestId}`);

/** DELETE /api/projects/:id/collaborate/:requestId/remove — owner removes an accepted collaborator */
export const removeCollaborator = (projectId, requestId) =>
  api.delete(`/projects/${projectId}/collaborate/${requestId}/remove`);

/** GET /api/projects/my  — get all projects posted by the logged-in user */
export const getMyProjects = () =>
  api.get("/projects/my");

/** GET /api/projects/:id/room  — get the community/channels for a project's chat room */
export const getProjectRoom = (projectId) =>
  api.get(`/projects/${projectId}/room`);
