import api from "./api";

export const searchUsers = (query) => api.get(`/user/search?q=${query}`);

export const getMyProfile = () => api.get("/user/me");

export const getPublicProfile = (userId) => api.get(`/user/${userId}`);

/**
 * Returns { xp, level, nextLevelXp, xpToNextLevel, skillXp }.
 * Components dispatch a `window` CustomEvent named `xp:refresh` to ask
 * subscribers to re-fetch (e.g. after a help-request resolve).
 */
export const getMyXp = () => api.get("/user/me/xp");
