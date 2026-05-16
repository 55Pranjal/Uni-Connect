import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logomark } from "../components/Navbar";
import GoogleSignInButton from "../components/GoogleSignInButton";
import AuthShell, { SideHero } from "../components/AuthShell";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
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
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      if (!data.user || !data.token) throw new Error("Invalid signup response");
      login(data.token, data.user);
      navigate("/ProfileDecision");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      sidebar={
        <SideHero
          eyebrow="Free for students"
          title="Your campus,"
          accent="all in one place."
          subtitle="A directory that turns into a network. Communities that don't drown you. Project rooms that actually ship."
          features={[
            "Find peers by skill, branch, or interest",
            "Real communities with mods + signal",
            "Private project rooms for your team",
          ]}
          preview={
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { k: "10k+", v: "Students" },
                { k: "300+", v: "Communities" },
                { k: "1.2k", v: "Projects" },
              ].map((s) => (
                <div key={s.v}>
                  <p
                    className="pl-display text-2xl tabular-nums leading-none"
                    style={{ color: "white" }}
                  >
                    {s.k}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {s.v}
                  </p>
                </div>
              ))}
            </div>
          }
        />
      }
    >
      <Link
        to="/"
        className="lg:hidden flex items-center gap-2 justify-center mb-10"
      >
        <Logomark />
        <span
          className="font-semibold"
          style={{ fontSize: 17, letterSpacing: "-0.02em" }}
        >
          UniConnect
        </span>
      </Link>

      <div className="mb-8">
        <span className="pl-eyebrow">
          <span className="dot" />
          Free forever for students
        </span>
        <h1
          className="pl-display mt-5"
          style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.25rem)" }}
        >
          Create your account.
        </h1>
        <p className="mt-2 text-base" style={{ color: "var(--pl-ink-2)" }}>
          One minute to set up. A campus to discover.
        </p>
      </div>

      {error && (
        <p
          className="text-sm px-4 py-2.5 rounded-xl mb-5"
          style={{
            color: "var(--pl-accent-hover)",
            background: "var(--pl-accent-soft)",
            border: "1px solid rgba(255, 90, 31, 0.25)",
          }}
        >
          {error}
        </p>
      )}

      <div className="mb-5">
        <GoogleSignInButton onError={setError} />
      </div>

      <div
        className="flex items-center gap-3 mb-5"
        style={{ color: "var(--pl-ink-3)" }}
      >
        <span
          className="h-px flex-1"
          style={{ background: "var(--pl-line-2)" }}
        />
        <span className="text-xs uppercase tracking-wide">or</span>
        <span
          className="h-px flex-1"
          style={{ background: "var(--pl-line-2)" }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Full name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ada Lovelace"
        />
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
          placeholder="At least 8 characters"
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
              Creating account…
            </>
          ) : (
            <>
              Create account
              <span className="arrow">→</span>
            </>
          )}
        </button>
      </form>

      <p
        className="text-sm text-center mt-8"
        style={{ color: "var(--pl-ink-3)" }}
      >
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold"
          style={{ color: "var(--pl-ink)" }}
        >
          Sign in →
        </Link>
      </p>
    </AuthShell>
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

export default Signup;
