import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

/**
 * Drop-in Google sign-in button. Renders Google's own styled button via
 * @react-oauth/google, posts the returned ID token to /api/auth/google,
 * then hands the resulting { token, user } to AuthContext.login().
 *
 * Routes new (un-onboarded) users to /profileDecision, returning users to /.
 * On failure, calls onError(message) so the host page can surface its own
 * error styling — falls back to a console.error.
 */
const GoogleSignInButton = ({ onError }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleSuccess = async (response) => {
    const credential = response?.credential;
    if (!credential) {
      onError?.("Google did not return a credential. Try again.");
      return;
    }

    setSubmitting(true);
    try {
      // Use the shared axios client so `withCredentials: true` is set —
      // raw fetch() defaults to "same-origin" credentials, which causes the
      // browser to silently discard the auth cookie on a cross-origin
      // response. The cookie is the source of truth post-login; without it
      // every subsequent /me, /me/xp, etc. returns 401.
      const { data } = await api.post(
        "/auth/google",
        { credential },
        { suppressToast: true }
      );

      if (!data.user || !data.token) {
        throw new Error("Invalid Google sign-in response");
      }

      login(data.token, data.user);
      navigate(data.user.isOnboarded ? "/" : "/profileDecision");
    } catch (err) {
      const serverMsg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        err?.message ??
        "Google sign-in failed";
      onError?.(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFailure = () => {
    onError?.("Google sign-in was cancelled or blocked.");
  };

  return (
    <div className="w-full flex justify-center" aria-busy={submitting}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleFailure}
        useOneTap={false}
        theme="outline"
        size="large"
        shape="pill"
        width="320"
      />
    </div>
  );
};

export default GoogleSignInButton;
