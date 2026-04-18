import api from "./api";

export const searchUsers = (query) => api.get(`/user/search?q=${query}`);

export const getMyProfile = () => api.get("/user/me");

export const getPublicProfile = (userId) => api.get(`/user/${userId}`);

export const updateProfile = (data) => api.patch("/user/profile", data);

export const updateCardSkills = (cardSkills) =>
  api.patch("/user/card-skills", { cardSkills });

export const updateProfileSkills = (profileSkills) =>
  api.patch("/user/profile-skills", { profileSkills });
