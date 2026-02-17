import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkillCard from "../components/cards/SkillCard";

import {
  sendConnectionRequest,
  acceptConnectionRequest,
} from "../api/connection";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import CommunityCard from "./cards/CommunityCard";

const DiscoverPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // 🔥 new

  const { token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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
  }, [query, token, authLoading, activeTab]);

  /* ================= SEARCH USERS ================= */
  const searchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user/search?q=${query}`);
      setResults(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH COMMUNITIES ================= */
  const searchCommunities = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/community?search=${query}`);
      setResults(res.data || []);
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
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleAccept = async (userId) => {
    try {
      await acceptConnectionRequest(userId);
      updateConnectionStatus(userId, "connected");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept request");
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] px-6 pt-16">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Discover
          </h1>

          {/* TABS */}
          <div className="flex justify-center mb-6 gap-4">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-xl ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200"
              }`}
            >
              Users
            </button>

            <button
              onClick={() => setActiveTab("communities")}
              className={`px-4 py-2 rounded-xl ${
                activeTab === "communities"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200"
              }`}
            >
              Communities
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative max-w-xl mx-auto mb-10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${
                activeTab === "users" ? "users" : "communities"
              }...`}
              className="w-full rounded-2xl border border-slate-300 px-5 py-4
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* RESULTS */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading && (
              <p className="text-slate-500 text-center col-span-full">
                Searching...
              </p>
            )}

            {!loading && results.length === 0 && query.length >= 2 && (
              <p className="text-slate-500 text-center col-span-full">
                No results found
              </p>
            )}

            {/* USERS */}
            {activeTab === "users" &&
              results.map((user) => (
                <SkillCard
                  key={user._id}
                  userId={user._id}
                  name={user.name}
                  dept={user.department}
                  year={user.year}
                  avatarSeed={user.avatarSeed}
                  profileLevel={0}
                  skills={user.skills || []}
                  connectionStatus={user.connectionStatus}
                  onConnect={handleConnect}
                  onAccept={handleAccept}
                />
              ))}

            {/* COMMUNITIES */}
            {activeTab === "communities" &&
              results.map((community) => (
                <CommunityCard key={community._id} community={community} />
              ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default DiscoverPage;
