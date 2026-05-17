import { Component } from "react";
import { useLocation } from "react-router-dom";

/**
 * Catches render-time errors anywhere in its subtree and renders a full-page
 * fallback instead of letting the whole app go blank. Errors are logged to the
 * console with their componentStack so they're still surfaced during dev.
 *
 * Resetting behaviour: this component holds error state. To recover after a
 * crash, either:
 *   1. The user clicks "Reload" → triggers a full page refresh.
 *   2. The parent re-keys the boundary (e.g. on route change) → React unmounts
 *      this instance and mounts a fresh one with hasError=false. That's the
 *      mechanism `RouteErrorBoundary` below uses.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(
      "ErrorBoundary caught:",
      error,
      "\ncomponentStack:",
      info?.componentStack,
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="pl-page min-h-screen flex items-center justify-center px-5"
        style={{ background: "var(--pl-bg)" }}
      >
        <div className="pl-soft-glow" />

        <div className="max-w-md w-full text-center pl-reveal relative">
          <span className="pl-eyebrow">
            <span className="dot" />
            Something went wrong
          </span>

          <h1
            className="pl-display mt-6"
            style={{ fontSize: "clamp(1.875rem, 4vw, 2.5rem)" }}
          >
            That's on us.
          </h1>

          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: "var(--pl-ink-2)" }}
          >
            An unexpected error broke this page. Reload to recover — if it
            keeps happening, let us know.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="pl-btn"
              style={{ padding: "0.85rem 1.5rem", fontSize: 15 }}
            >
              Reload
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * ErrorBoundary keyed by current pathname so navigating away from a crashed
 * page auto-recovers. Without this, hasError would stay true forever and the
 * user would be stuck on the fallback even after clicking a link.
 */
export const RouteErrorBoundary = ({ children }) => {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
};

export default ErrorBoundary;
