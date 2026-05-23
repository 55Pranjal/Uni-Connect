import React from "react";
import { Link } from "react-router-dom";
import { Logomark } from "./Navbar";

const FooterCol = ({ title, links }) => (
  <div>
    <p
      className="text-sm font-semibold mb-3"
      style={{ letterSpacing: "-0.01em" }}
    >
      {title}
    </p>
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            to={l.to}
            className="text-sm transition-colors"
            style={{ color: "var(--pl-ink-3)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--pl-ink)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--pl-ink-3)")
            }
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer
    style={{
      background: "var(--pl-bg)",
      borderTop: "1px solid var(--pl-line)",
      marginTop: "auto",
    }}
  >
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <Logomark />
            <span
              className="font-semibold"
              style={{ fontSize: 17, letterSpacing: "-0.02em" }}
            >
              UniConnect
            </span>
          </Link>
          <p
            className="text-sm mt-4 max-w-xs leading-relaxed"
            style={{ color: "var(--pl-ink-3)" }}
          >
            Made by students, for students. A calmer way to find the people on
            your campus.
          </p>
        </div>

        <FooterCol
          title="Product"
          links={[
            { to: "/discover", label: "Discover" },
            { to: "/communities", label: "Communities" },
            { to: "/projects", label: "Projects" },
          ]}
        />
        <FooterCol
          title="Get started"
          links={[{ to: "/login", label: "Sign in with Google" }]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "#", label: "About" },
            { to: "#", label: "Privacy" },
            { to: "#", label: "Terms" },
          ]}
        />
      </div>

      <div
        className="mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-sm"
        style={{
          borderTop: "1px solid var(--pl-line)",
          color: "var(--pl-ink-3)",
        }}
      >
        <p>© 2026 UniConnect</p>
        <p className="inline-flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#16a34a" }}
          />
          All systems normal
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
