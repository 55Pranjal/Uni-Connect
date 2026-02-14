import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* ================= INIT ================= */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(storedToken);

        const res = await axios.get(`${BACKEND_URL}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const backendUser = res.data.user || res.data;

        // 🔥 Normalize user shape here (IMPORTANT FIX)
        const normalizedUser = {
          ...backendUser,
          _id: backendUser._id || backendUser.id,
        };

        setUser(normalizedUser);
      } catch (err) {
        console.error("Auth verification failed:", err.message);

        // Remove only auth-related keys
        localStorage.removeItem("token");
        localStorage.removeItem("avatarSeed");

        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /* ================= LOGIN ================= */
  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("avatarSeed", userData.avatarSeed);

    // 🔥 Normalize on login too (prevents mismatch later)
    const normalizedUser = {
      ...userData,
      _id: userData._id || userData.id,
    };

    setToken(newToken);
    setUser(normalizedUser);
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("avatarSeed");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
