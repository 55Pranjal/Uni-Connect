import api from "./api";

export const searchUsers = (query) => api.get(`/user/search?q=${query}`);

export const getMyProfile = () => api.get("/user/me");

export const getPublicProfile = (userId) => api.get(`/user/${userId}`);
