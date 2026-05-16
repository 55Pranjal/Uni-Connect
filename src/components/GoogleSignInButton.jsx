import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

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
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google sign-in failed");
      if (!data.user || !data.token) {
        throw new Error("Invalid Google sign-in response");
      }

      login(data.token, data.user);
      navigate(data.user.isOnboarded ? "/" : "/profileDecision");
    } catch (err) {
      onError?.(err.message);
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
