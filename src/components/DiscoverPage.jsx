import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkillCard from "../components/SkillCard";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
} from "../api/connection";
import { useAuth } from "../context/AuthContext";

const DiscoverPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token, loading: authLoading } = useAuth(); // 🔥 single source

  /* ================= DEBOUNCED SEARCH ================= */
  useEffect(() => {
    if (authLoading) return;

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (!token) return; // don't search if not authenticated

    const timeout = setTimeout(() => {
      searchUsers();
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, token, authLoading]);

  const searchUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/search?q=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      setResults(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CONNECTION HANDLERS ================= */
  const updateConnectionStatus = (userId, status) => {
    setResults((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, connectionStatus: status } : u,
      ),
    );
  };

  const handleConnect = async (userId) => {
    try {
      await sendConnectionRequest(userId);
      updateConnectionStatus(userId, "pending_sent");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleAccept = async (userId) => {
    try {
      await acceptConnectionRequest(userId);
      updateConnectionStatus(userId, "connected");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to accept request");
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] px-6 pt-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
            Discover People
          </h1>
          <p className="text-slate-500 text-center mb-8">
            Search by name to find people you know
          </p>

          <div className="relative max-w-xl mx-auto mb-10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name (e.g. Pranjal)"
              className="w-full rounded-2xl border border-slate-300 px-5 py-4
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {authLoading && (
              <p className="text-slate-500 text-center col-span-full">
                Checking authentication...
              </p>
            )}

            {!authLoading && loading && (
              <p className="text-slate-500 text-center col-span-full">
                Searching…
              </p>
            )}

            {!authLoading &&
              !loading &&
              results.length === 0 &&
              query.length >= 2 && (
                <p className="text-slate-500 text-center col-span-full">
                  No users found
                </p>
              )}

            {results.map((user) => (
              <SkillCard
                key={user._id}
                userId={user._id}
                name={user.name}
                dept={user.department}
                year={user.year}
                avatarSeed={user.avatarSeed}
                profileLevel={0}
                skills={
                  user.skills?.filter((s) =>
                    user.cardSkills?.includes(s.name),
                  ) || []
                }
                connectionStatus={user.connectionStatus}
                onConnect={handleConnect}
                onAccept={handleAccept}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default DiscoverPage;
