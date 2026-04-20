import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAvatarUrl } from "../utils/avatar";

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();

  // Optional: prevent flicker while verifying token
  if (loading) return null;

  const avatarUrl = user?.avatarSeed
    ? getAvatarUrl(user.avatarSeed)
    : getAvatarUrl("guest");

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <h1 className="font-extrabold text-xl text-indigo-600">UniConnect</h1>

        {/* Links */}
        {isAuthenticated && (
          <div className="hidden md:flex gap-6 text-slate-600 font-medium">
            <Link to="/" className="hover:text-indigo-600">
              Home
            </Link>
            <Link to="/discover" className="hover:text-indigo-600">
              Discover
            </Link>

            <Link to="/communities" className="hover:text-indigo-600">
              Communities
            </Link>

            <Link to="/projects" className="hover:text-indigo-600">
              Projects
            </Link>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-slate-600 hover:text-indigo-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <img
                  src={avatarUrl}
                  alt="profile"
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-500 bg-white cursor-pointer"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
