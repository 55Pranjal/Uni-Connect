import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * AuthProvider — cookie-based auth.
 *
 * The JWT lives in an httpOnly cookie set by the backend on /auth/google
 * (Google OAuth is the only sign-in path; email/password was removed to
 * prevent fake-account abuse). JS can't read it (that's the point — XSS
 * can't exfiltrate it). On every API call axios sends the cookie
 * automatically because `withCredentials: true` is set on the shared client.
 *
 * Boot flow:
 *   1. Ask the server `who am I?` via /api/user/me — the cookie rides along.
 *   2. If 200, we're logged in. Cache the user.
 *   3. If 401, no valid cookie — render as logged-out.
 *
 * login(token, userData) is called by GoogleSignInButton after a successful
 * /auth/google round-trip. The cookie is already set by the server at that
 * point; the `token` argument is kept in the signature for backward
 * compatibility and is otherwise unused.
 *
 * logout() hits /api/auth/logout to clear the server cookie, then resets
 * local state. Even if the server is unreachable we still clear locally —
 * the cookie will eventually expire and the user clearly wants out.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= INIT ================= */
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/user/me`, {
          withCredentials: true,
        });
        if (cancelled) return;

        const backendUser = res.data.user || res.data;
        const normalizedUser = {
          ...backendUser,
          _id: backendUser._id || backendUser.id,
        };
        setUser(normalizedUser);
      } catch {
        // 401 from /me just means "not logged in" — that's a normal state on
        // a fresh visit, not an error worth logging.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= LOGIN =================
     Signature kept as (token, userData) so GoogleSignInButton doesn't need
     a change. The token argument is intentionally unused — the cookie is
     the source of truth. */

  const login = (_token, userData) => {
    // Some legacy code still reads avatarSeed from localStorage; keep that
    // cache populated as a courtesy. The auth source remains the cookie.
    if (userData?.avatarSeed) {
      try {
        localStorage.setItem("avatarSeed", userData.avatarSeed);
      } catch {
        /* private-mode safari etc. — ignore */
      }
    }

    setUser({
      ...userData,
      _id: userData._id || userData.id,
    });
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, null, {
        withCredentials: true,
      });
    } catch {
      // Best-effort: even if the server didn't ack, clear local state.
    }
    try {
      localStorage.removeItem("avatarSeed");
      // Defensive: remove any leftover legacy token from before this migration.
      localStorage.removeItem("token");
    } catch {
      /* ignore */
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        // Legacy field — some components (e.g. SkillCard) check `token` as a
        // proxy for "is the user authenticated." We expose a truthy sentinel
        // when logged in so those checks keep working without per-component
        // changes. Prefer `isAuthenticated` in new code.
        token: user ? "cookie" : null,
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
