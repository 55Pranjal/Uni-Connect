import { Link } from "react-router-dom";
import SharedNavbar from "../components/Navbar";
import SharedFooter from "../components/Footer";

const NotFound = () => (
  <div
    className="pl-page min-h-screen flex flex-col"
    style={{ background: "var(--pl-bg)" }}
  >
    <SharedNavbar />

    <main className="flex-1 relative overflow-hidden flex items-center justify-center">
      <div className="pl-soft-glow" />

      <div className="max-w-xl mx-auto px-5 sm:px-8 py-20 text-center pl-reveal relative">
        <span className="pl-eyebrow">
          <span className="dot" />
          404 · Page not found
        </span>

        <h1
          className="pl-display mt-6"
          style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
        >
          We looked, but this{" "}
          <span style={{ color: "var(--pl-accent)" }}>page</span> isn't here.
        </h1>

        <p
          className="mt-5 text-base leading-relaxed"
          style={{ color: "var(--pl-ink-2)" }}
        >
          The link you followed might be broken, or the page may have moved.
        </p>

        <div className="mt-9 flex justify-center">
          <Link
            to="/"
            className="pl-btn"
            style={{ padding: "0.85rem 1.5rem", fontSize: 15 }}
          >
            Back home
            <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </main>

    <SharedFooter />
  </div>
);

export default NotFound;
