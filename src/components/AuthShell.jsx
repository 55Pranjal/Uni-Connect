import React from "react";
import { Link } from "react-router-dom";
import { Logomark } from "./Navbar";

/**
 * Two-column layout used by /login, /signup, /profileDecision and /onboarding.
 *
 *   <AuthShell sidebar={<SideHero ... />}>
 *     {formContents}
 *   </AuthShell>
 *
 * On desktop: dark hero on the left (~52%) + light form on the right (~48%).
 * On mobile/tablet: sidebar is hidden, form takes the full viewport.
 */
const AuthShell = ({ sidebar, children }) => (
  <div className="auth-shell pl-page" style={{ background: "var(--pl-bg)" }}>
    <aside className="auth-side">{sidebar}</aside>
    <main className="flex items-center justify-center px-5 py-10 sm:py-12 relative">
      <div className="pl-soft-glow lg:hidden" />
      <div className="w-full max-w-sm pl-reveal relative">{children}</div>
    </main>
  </div>
);

/**
 * Default sidebar hero — a stacked block of: logomark, eyebrow, headline,
 * subtitle, optional features list, and a tiny preview chip + footer.
 */
export const SideHero = ({
  eyebrow,
  title,
  accent,
  subtitle,
  features = [],
  footer,
  preview,
  topRight,
}) => (
  <div className="flex flex-col h-full justify-between gap-10 pl-reveal">
    {/* Top — brand */}
    <div className="flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <Logomark />
        <span
          className="font-semibold tracking-tight"
          style={{ fontSize: 17, color: "white", letterSpacing: "-0.02em" }}
        >
          UniConnect
        </span>
      </Link>
      {topRight ?? (
        <Link to="/" className="auth-side-link text-sm">
          ← Back home
        </Link>
      )}
    </div>

    {/* Middle — pitch */}
    <div className="max-w-md">
      {eyebrow && (
        <span className="auth-side-eyebrow">
          <span className="dot" />
          {eyebrow}
        </span>
      )}
      <h1
        className="pl-display mt-6"
        style={{
          fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
          color: "white",
          lineHeight: 1.05,
        }}
      >
        {title}
        {accent && (
          <>
            {" "}
            <span style={{ color: "var(--pl-accent)" }}>{accent}</span>
          </>
        )}
      </h1>
      {subtitle && (
        <p
          className="mt-5 text-base leading-relaxed"
          style={{ color: "rgba(255,255,255,0.7)", maxWidth: 420 }}
        >
          {subtitle}
        </p>
      )}

      {features.length > 0 && (
        <ul className="mt-8 space-y-3.5">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="auth-side-check">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {f}
              </span>
            </li>
          ))}
        </ul>
      )}

      {preview && <div className="mt-10">{preview}</div>}
    </div>

    {/* Bottom — footer signature */}
    <div
      className="flex items-center justify-between text-xs"
      style={{ color: "rgba(255,255,255,0.4)" }}
    >
      {footer ?? <span>© 2026 UniConnect — built for students.</span>}
      <span className="inline-flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "var(--pl-accent)",
            boxShadow: "0 0 0 3px rgba(255,90,31,0.2)",
          }}
        />
        Online
      </span>
    </div>
  </div>
);

/** Small fake chat-bubble preview used in some hero variants. */
export const PreviewChip = ({ name, text }) => (
  <div className="auth-side-chip">
    <span
      className="w-8 h-8 rounded-full flex-shrink-0"
      style={{
        background: "linear-gradient(135deg, #fed7aa, #ff5a1f)",
      }}
    />
    <div className="leading-tight">
      <p className="text-xs font-semibold">{name}</p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
        {text}
      </p>
    </div>
  </div>
);

export default AuthShell;
