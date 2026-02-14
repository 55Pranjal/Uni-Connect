import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkillCard from "../components/SkillCard";
import api from "../api/api";
import { acceptConnectionRequest, removeConnection } from "../api/connection";

const TABS = ["incoming", "connected", "sent"];

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState("incoming");
  const [connections, setConnections] = useState({
    incoming: [],
    connected: [],
    sent: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await api.get("/connections");
      setConnections(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  // ===== ACCEPT =====
  const handleAccept = async (userId) => {
    try {
      await acceptConnectionRequest(userId);

      setConnections((prev) => {
        const acceptedUser = prev.incoming.find((u) => u._id === userId);

        return {
          ...prev,
          incoming: prev.incoming.filter((u) => u._id !== userId),
          connected: acceptedUser
            ? [...prev.connected, acceptedUser]
            : prev.connected,
        };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to accept request");
    }
  };

  // ===== REJECT (pending) =====
  const handleReject = async (userId) => {
    try {
      await removeConnection(userId);

      setConnections((prev) => ({
        ...prev,
        incoming: prev.incoming.filter((u) => u._id !== userId),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to reject request");
    }
  };

  // ===== REMOVE (connected) =====
  const handleRemove = async (userId) => {
    try {
      await removeConnection(userId);

      setConnections((prev) => ({
        ...prev,
        connected: prev.connected.filter((u) => u._id !== userId),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to remove connection");
    }
  };

  const renderList = (list, status) => {
    if (list.length === 0) {
      return (
        <p className="text-center text-slate-500 col-span-full">
          No users here
        </p>
      );
    }

    return list.map((user) => (
      <SkillCard
        key={user._id}
        userId={user._id}
        name={user.name}
        dept={user.department}
        year={user.year}
        avatarSeed={user._id}
        profileLevel={0}
        skills={user.cardSkills || []}
        connectionStatus={status}
        onAccept={status === "pending_received" ? handleAccept : undefined}
        onReject={status === "pending_received" ? handleReject : undefined}
        onRemove={status === "connected" ? handleRemove : undefined}
      />
    ));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] px-6 pt-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Connections
          </h1>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition
                  ${
                    activeTab === tab
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {connections[tab]?.length > 0 && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {connections[tab].length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading && (
              <p className="text-center col-span-full text-slate-500">
                Loading connections…
              </p>
            )}

            {!loading &&
              activeTab === "incoming" &&
              renderList(connections.incoming, "pending_received")}

            {!loading &&
              activeTab === "connected" &&
              renderList(connections.connected, "connected")}

            {!loading &&
              activeTab === "sent" &&
              renderList(connections.sent, "pending_sent")}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ConnectionsPage;
