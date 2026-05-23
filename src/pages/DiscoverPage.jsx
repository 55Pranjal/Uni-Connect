import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkillCard from "../components/cards/SkillCard";
import { CardSkeletonGrid } from "../components/Skeleton";

import {
  sendConnectionRequest,
  acceptConnectionRequest,
} from "../api/connection";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import CommunityCard from "../components/cards/CommunityCard";
import { invalidate } from "../lib/queryEvents";
import { CONNECTIONS_KEY } from "../hooks/useConnections";

const DiscoverPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const { token, loading: authLoading } = useAuth();

  /* ================= HANDLE COMMUNITY DELETE ================= */

  useEffect(() => {
    const handleCommunityDelete = (e) => {
      const deletedId = e.detail;

      setResults((prev) =>
        prev.filter((community) => community._id !== deletedId)
      );
    };

    window.addEventListener("communityDeleted", handleCommunityDelete);

    return () =>
      window.removeEventListener("communityDeleted", handleCommunityDelete);
  }, []);

  /* ================= SEARCH USERS ================= */
  // useCallback so the identity is stable across renders that don't change
  // `query`. Without this the debounce effect below would have to omit the
  // search fns from its deps (eslint warns) or re-fire on every keystroke
  // identity churn instead of on query change.
  const searchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user/search?q=${query}`);
      setResults(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  /* ================= SEARCH COMMUNITIES ================= */

  const searchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/community?search=${query}`);
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  /* ================= DEBOUNCED SEARCH ================= */

  useEffect(() => {
    if (authLoading) return;

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (!token) return;

    const timeout = setTimeout(() => {
      if (activeTab === "users") {
        searchUsers();
      } else {
        searchCommunities();
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, token, authLoading, activeTab, searchUsers, searchCommunities]);

  /* ================= CONNECTION HANDLERS ================= */

  const updateConnectionStatus = (userId, status) => {
    setResults((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, connectionStatus: status } : u
      )
    );
  };

  const handleConnect = async (userId) => {
    try {
      await sendConnectionRequest(userId);
      updateConnectionStatus(userId, "pending_sent");
      invalidate(CONNECTIONS_KEY);
    } catch {
      /* api interceptor surfaces the toast */
    }
  };

  const handleAccept = async (userId) => {
    try {
      await acceptConnectionRequest(userId);
      updateConnectionStatus(userId, "connected");
      invalidate(CONNECTIONS_KEY);
    } catch {
      /* api interceptor surfaces the toast */
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 w-full pl-page">
        {/* HEADER */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
          <div className="pl-reveal max-w-2xl">
            <span className="pl-eyebrow">
              <span className="dot" />
              Discover
            </span>
            <h1
              className="pl-display mt-5"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Find your{" "}
              <span style={{ color: "var(--pl-accent)" }}>people</span>.
            </h1>
            <p className="mt-4 text-lg" style={{ color: "var(--pl-ink-2)" }}>
              Search by name, skill, or community — results appear as you type.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
          {/* SEARCH + TABS */}
          <div className="pl-reveal mb-10">
            <div
              className="relative flex items-center rounded-2xl"
              style={{
                background: "var(--pl-bg)",
                boxShadow: "inset 0 0 0 1px var(--pl-line-2)",
              }}
            >
              <svg
                className="w-5 h-5 ml-4"
                style={{ color: "var(--pl-ink-3)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${
                  activeTab === "users" ? "students" : "communities"
                } — name, skill, branch…`}
                className="flex-1 px-3 py-3.5 bg-transparent outline-none text-base"
                style={{ color: "var(--pl-ink)" }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="pl-btn-ghost mr-2"
                  style={{ padding: "0.4rem 0.6rem", fontSize: 12 }}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mt-5">
              {[
                { key: "users", label: "Students" },
                { key: "communities", label: "Communities" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition"
                  style={
                    activeTab === t.key
                      ? {
                          background: "var(--pl-ink)",
                          color: "var(--pl-bg)",
                        }
                      : {
                          color: "var(--pl-ink-2)",
                          background: "transparent",
                        }
                  }
                >
                  {t.label}
                </button>
              ))}
              <span
                className="ml-auto text-xs"
                style={{ color: "var(--pl-ink-3)" }}
              >
                {results.length > 0
                  ? `${results.length} result${results.length === 1 ? "" : "s"}`
                  : ""}
              </span>
            </div>
          </div>

          {/* RESULTS */}
          {loading ? (
            <CardSkeletonGrid
              kind={activeTab === "communities" ? "community" : "skill"}
              count={6}
            />
          ) : query.trim().length < 2 ? (
            <div className="py-20 text-center max-w-md mx-auto">
              <p
                className="pl-display text-2xl"
                style={{ color: "var(--pl-ink)" }}
              >
                Start typing — anything.
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--pl-ink-3)" }}>
                A name, a skill ("React"), a community, or just a vibe.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto">
              <p
                className="pl-display text-2xl"
                style={{ color: "var(--pl-ink)" }}
              >
                No matches for "{query}".
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--pl-ink-3)" }}>
                Try a different keyword or switch sections.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeTab === "users" &&
                results.map((user, i) => (
                  <div
                    key={user._id}
                    className="pl-reveal"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <SkillCard
                      userId={user._id}
                      name={user.name}
                      dept={user.department}
                      year={user.year}
                      avatarSeed={user.avatarSeed}
                      level={user.level ?? 1}
                      skills={user.skills || []}
                      connectionStatus={user.connectionStatus}
                      onConnect={handleConnect}
                      onAccept={handleAccept}
                    />
                  </div>
                ))}

              {activeTab === "communities" &&
                results.map((community, i) => (
                  <div
                    key={community._id}
                    className="pl-reveal"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <CommunityCard community={community} />
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default DiscoverPage;
