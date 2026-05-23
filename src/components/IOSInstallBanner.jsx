import { useEffect, useState } from "react";

/**
 * iOS-only Add-to-Home-Screen nudge.
 *
 * Web Push on iOS Safari only works for PWAs that the user has installed
 * via Share → Add to Home Screen. Users won't know this without being
 * told — the EnablePushPrompt in Profile can't actually deliver pushes
 * until they've installed, so we have to surface the install path first.
 *
 * Detection:
 *   1. Browser is iOS Safari (iPhone, iPod, OR iPad-on-iPadOS-13+ which
 *      reports as Mac with touch points).
 *   2. App is NOT already running as a standalone PWA — we use both the
 *      modern matchMedia query and the legacy navigator.standalone iOS
 *      property because Safari has historically supported them
 *      inconsistently across versions.
 *
 * Persistence:
 *   Once dismissed, we set a versioned localStorage flag so the same
 *   banner doesn't reappear on every visit. The version suffix lets us
 *   re-show the banner if we ever update the messaging meaningfully.
 *
 * Placement:
 *   Renders as a fixed bottom-of-viewport card with env(safe-area-inset-*)
 *   padding so it sits above the iOS home indicator on devices without
 *   a hardware Home button. position: fixed means it never shifts the
 *   actual page layout above it.
 */

const DISMISS_KEY = "ios-install-banner-dismissed-v1";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Classic iOS check.
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return true;
  // iPadOS 13+ reports as Mac but exposes touch points (desktops don't).
  if (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  ) {
    return true;
  }
  return false;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  // Modern: display-mode media query.
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // Legacy iOS Safari: navigator.standalone === true when launched from
  // the home screen.
  if (window.navigator.standalone === true) return true;
  return false;
}

const IOSInstallBanner = () => {
  // Default false until the effect runs — avoids a flash on first paint
  // and keeps SSR-safe (though Vite doesn't SSR by default, no harm).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOS()) return;
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* private-mode Safari blocks localStorage — fall through and show */
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* same as above — best-effort, don't break UX if storage is denied */
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby="ios-install-banner-title"
      className="fixed left-0 right-0 z-50 px-4"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        pointerEvents: "none",
      }}
    >
      <div
        className="mx-auto max-w-md rounded-2xl shadow-lg p-4 flex items-start gap-3"
        style={{
          background: "white",
          border: "1px solid var(--pl-line)",
          pointerEvents: "auto",
        }}
      >
        {/* Brand swatch using the accent color so the banner reads as part
            of the app, not a system toast. */}
        <div
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
          style={{
            background: "var(--pl-ink)",
            fontSize: 14,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ color: "var(--pl-accent)" }}>U</span>
          <span style={{ marginLeft: -2 }}>c</span>
        </div>

        <div className="flex-1 min-w-0">
          <p
            id="ios-install-banner-title"
            className="font-semibold text-sm"
            style={{ color: "var(--pl-ink)" }}
          >
            Add UniConnect to your Home Screen
          </p>
          <p
            className="text-xs mt-1 leading-snug"
            style={{ color: "var(--pl-ink-2)" }}
          >
            Tap <ShareGlyph /> in Safari, then{" "}
            <span className="font-medium">Add to Home Screen</span>. Required
            for notifications to reach you when the app is closed.
          </p>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install banner"
          className="shrink-0 -mt-1 -mr-1 p-1 rounded-md transition"
          style={{ color: "var(--pl-ink-3)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * The iOS Share icon glyph (the square-with-up-arrow), drawn inline so users
 * see the exact symbol they'll be tapping. Sized to sit cleanly on a line
 * of text.
 */
const ShareGlyph = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Share"
    style={{
      display: "inline-block",
      verticalAlign: "-2px",
      color: "var(--pl-accent-hover)",
    }}
  >
    <path d="M12 3v12" />
    <path d="M8 7l4-4 4 4" />
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
  </svg>
);

export default IOSInstallBanner;
