import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAvatarUrl } from "../utils/avatar";
import LevelBadge from "./LevelBadge";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/communities", label: "Communities" },
  { to: "/projects", label: "Projects" },
];

export const Logomark = () => (
  <span
    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white font-bold"
    style={{
      background: "var(--pl-ink)",
      fontSize: 13,
      letterSpacing: "-0.02em",
    }}
  >
    <span style={{ color: "var(--pl-accent)" }}>U</span>
    <span style={{ marginLeft: -2 }}>c</span>
  </span>
);

const Navbar = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  if (loading) return null;

  const avatarUrl = user?.avatarSeed
    ? getAvatarUrl(user.avatarSeed)
    : getAvatarUrl("guest");

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--pl-line)" }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Logomark />
          <span
            className="font-semibold"
            style={{ fontSize: 17, letterSpacing: "-0.02em" }}
          >
            UniConnect
          </span>
        </Link>

        {/* Center nav */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `pl-nav-link${isActive ? " pl-nav-link-active" : ""}`
                }
                style={({ isActive }) =>
                  isActive
                    ? { color: "var(--pl-ink)", background: "var(--pl-surface)" }
                    : undefined
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="pl-btn-ghost hidden sm:inline-flex">
                Sign in
              </Link>
              <Link to="/signup" className="pl-btn">
                Get started
                <span className="arrow">→</span>
              </Link>
            </>
          ) : (
            <>
              <div className="hidden sm:block">
                <LevelBadge compact />
              </div>

              <Link
                to="/connections"
                title="Connections"
                className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg transition"
                style={{ color: "var(--pl-ink-2)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--pl-surface)";
                  e.currentTarget.style.color = "var(--pl-ink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--pl-ink-2)";
                }}
              >
                <svg
                  className="w-[18px] h-[18px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a4 4 0 00-5-4m-4 6H2v-2a4 4 0 015-4m4 0a4 4 0 100-8 4 4 0 010 8zm6-8a3 3 0 11-6 0 3 3 0 016 0zM7 8a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>

              <Link
                to="/profile"
                className="relative group"
                title={user?.name}
              >
                <img
                  src={avatarUrl}
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover transition"
                  style={{ boxShadow: "inset 0 0 0 1px var(--pl-line-2)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 0 2px var(--pl-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 0 1px var(--pl-line-2)";
                  }}
                />
              </Link>

              <button
                aria-label="Toggle menu"
                className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg transition"
                style={{ color: "var(--pl-ink-2)" }}
                onClick={() => setOpen((p) => !p)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  viewBox="0 0 24 24"
                >
                  {open ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7h16M4 12h16M4 17h16"
                    />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && isAuthenticated && (
        <div
          className="md:hidden"
          style={{
            background: "white",
            borderBottom: "1px solid var(--pl-line)",
          }}
        >
          <div className="px-5 py-3 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="pl-nav-link"
                  style={
                    isActive
                      ? {
                          color: "var(--pl-ink)",
                          background: "var(--pl-surface)",
                        }
                      : undefined
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            <Link to="/connections" className="pl-nav-link">
              Connections
            </Link>
            <div className="pt-3 pb-1">
              <LevelBadge />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
