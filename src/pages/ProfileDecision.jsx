import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logomark } from "../components/Navbar";
import AuthShell, { SideHero } from "../components/AuthShell";

const ProfileDecision = () => {
  const navigate = useNavigate();

  return (
    <AuthShell
      sidebar={
        <SideHero
          eyebrow="Almost there"
          title="A profile worth"
          accent="showing up with."
          subtitle="A complete profile gets faster replies, better match suggestions, and an actual chance at being found by the right people."
          features={[
            "Get faster replies on help requests",
            "Match with students who share your interests",
            "Show off skills people can actually look up",
          ]}
          preview={
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  Profile completion
                </p>
                <p
                  className="text-xs tabular-nums font-semibold"
                  style={{ color: "var(--pl-accent)" }}
                >
                  30%
                </p>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: "30%",
                    background: "var(--pl-accent)",
                    boxShadow: "0 0 18px rgba(255,90,31,0.35)",
                  }}
                />
              </div>
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
          One more step
        </span>
        <h1
          className="pl-display mt-5"
          style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.25rem)" }}
        >
          You're almost there.
        </h1>
        <p className="mt-2 text-base" style={{ color: "var(--pl-ink-2)" }}>
          Complete your profile to unlock meaningful conversations.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div
          className="flex justify-between text-xs mb-2"
          style={{ color: "var(--pl-ink-3)" }}
        >
          <span>Profile completion</span>
          <span
            className="tabular-nums font-semibold"
            style={{ color: "var(--pl-ink)" }}
          >
            30%
          </span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--pl-line)" }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: "30%", background: "var(--pl-accent)" }}
          />
        </div>
      </div>

      {/* Benefits card */}
      <div
        className="rounded-2xl p-5 mb-8"
        style={{
          background: "var(--pl-accent-soft)",
          border: "1px solid rgba(255, 90, 31, 0.22)",
        }}
      >
        <p
          className="font-semibold mb-3 text-sm"
          style={{ color: "var(--pl-accent-ink)" }}
        >
          Completing your profile lets you:
        </p>
        <ul className="space-y-2">
          {[
            "Get faster replies",
            "Find students with matching interests",
            "Request & offer help",
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-2.5 text-sm"
              style={{ color: "var(--pl-ink-2)" }}
            >
              <span
                className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                style={{ background: "var(--pl-accent)" }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/onboarding")}
          className="pl-btn w-full justify-center"
          style={{ padding: "0.85rem 1.25rem", fontSize: 15 }}
        >
          Complete profile
          <span className="arrow">→</span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full text-center py-3 rounded-xl font-medium text-sm transition"
          style={{ color: "var(--pl-ink-3)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--pl-ink)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--pl-ink-3)")
          }
        >
          I'll do this later
        </button>
      </div>
    </AuthShell>
  );
};

export default ProfileDecision;
