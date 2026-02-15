import api from "./api";

export const sendConnectionRequest = (userId) =>
  api.post(`/connections/request/${userId}`);

export const acceptConnectionRequest = (userId) =>
  api.patch(`/connections/accept/${userId}`);

export const removeConnection = (userId) =>
  api.delete(`/connections/${userId}`);
