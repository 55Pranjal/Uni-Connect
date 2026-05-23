import { useState } from "react";
import { Link } from "react-router-dom";
import { Logomark } from "../components/Navbar";
import GoogleSignInButton from "../components/GoogleSignInButton";
import AuthShell, { SideHero, PreviewChip } from "../components/AuthShell";

const Login = () => {
  const [error, setError] = useState("");

  return (
    <AuthShell
      sidebar={
        <SideHero
          eyebrow="Sign in"
          title="Pick up right"
          accent="where you left off."
          subtitle="Your circle, your communities, and the projects you're shipping — they're all waiting on the other side."
          features={[
            "Continue chats with your connections",
            "Drop back into community threads",
            "See where your project rooms moved",
          ]}
          preview={
            <PreviewChip
              name="3 new connection requests"
              text="Tap to review"
            />
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
        <h1
          className="pl-display"
          style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.25rem)" }}
        >
          Welcome.
        </h1>
        <p className="mt-2 text-base" style={{ color: "var(--pl-ink-2)" }}>
          Sign in with your Google account to continue. New here? Same button —
          your account is created on first sign-in.
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

      <div className="mb-4">
        <GoogleSignInButton onError={setError} />
      </div>

      <p
        className="text-xs text-center mt-6"
        style={{ color: "var(--pl-ink-3)" }}
      >
        By continuing you agree to our terms and privacy policy.
      </p>
    </AuthShell>
  );
};

export default Login;
