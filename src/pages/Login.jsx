import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logomark } from "../components/Navbar";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (!data.user || !data.token) throw new Error("Invalid login response");
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="pl-page min-h-screen relative flex items-center justify-center px-5 py-12"
      style={{ background: "var(--pl-bg)" }}
    >
      <div className="pl-soft-glow" />

      <div className="w-full max-w-sm pl-reveal relative">
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <Logomark />
          <span
            className="font-semibold"
            style={{ fontSize: 17, letterSpacing: "-0.02em" }}
          >
            UniConnect
          </span>
        </Link>

        <div className="text-center mb-8">
          <h1
            className="pl-display"
            style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)" }}
          >
            Welcome back.
          </h1>
          <p
            className="mt-3 text-base"
            style={{ color: "var(--pl-ink-2)" }}
          >
            Sign in to continue where you left off.
          </p>
        </div>

        {error && (
          <p
            className="text-sm px-4 py-2.5 rounded-xl mb-5 text-center"
            style={{
              color: "var(--pl-accent-hover)",
              background: "var(--pl-accent-soft)",
              border: "1px solid rgba(255, 90, 31, 0.25)",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@college.edu"
          />

          <Field
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-xs font-medium"
                style={{ color: "var(--pl-ink-3)" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="pl-btn w-full justify-center mt-2"
            style={{ padding: "0.85rem 1.25rem", fontSize: 15 }}
          >
            {loading ? (
              <>
                <span
                  className="h-3.5 w-3.5 rounded-full animate-spin"
                  style={{
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                  }}
                />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </form>

        <p
          className="text-sm text-center mt-8"
          style={{ color: "var(--pl-ink-3)" }}
        >
          New here?{" "}
          <Link
            to="/signup"
            className="font-semibold"
            style={{ color: "var(--pl-ink)" }}
          >
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  );
};

const Field = ({ label, suffix, ...inputProps }) => (
  <label className="block">
    <span
      className="block text-xs font-medium mb-1.5"
      style={{ color: "var(--pl-ink-2)" }}
    >
      {label}
    </span>
    <span
      className="flex items-center rounded-xl bg-white"
      style={{ boxShadow: "inset 0 0 0 1px var(--pl-line-2)" }}
    >
      <input
        {...inputProps}
        required
        className="flex-1 px-4 py-3 bg-transparent rounded-xl outline-none text-sm"
        style={{ color: "var(--pl-ink)" }}
      />
      {suffix && <span className="pr-3">{suffix}</span>}
    </span>
  </label>
);

export default Login;
