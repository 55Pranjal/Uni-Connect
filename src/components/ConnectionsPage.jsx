import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SkillCard from "../components/cards/SkillCard";
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
        <div
          className="col-span-full text-center py-16"
          style={{ color: "var(--pl-ink-3)" }}
        >
          <p
            className="pl-display text-xl"
            style={{ color: "var(--pl-ink)" }}
          >
            Nothing here yet.
          </p>
          <p className="text-sm mt-1">
            Head to Discover to find new people.
          </p>
        </div>
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
        level={user.level ?? 1}
        skills={user.cardSkills || []}
        connectionStatus={status}
        onAccept={status === "pending_received" ? handleAccept : undefined}
        onReject={status === "pending_received" ? handleReject : undefined}
        onRemove={status === "connected" ? handleRemove : undefined}
      />
    ));
  };

  const TAB_LABELS = {
    incoming: "Incoming",
    connected: "Connected",
    sent: "Sent",
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 w-full pl-page">
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-8">
          <div className="pl-reveal max-w-2xl">
            <span className="pl-eyebrow">
              <span className="dot" />
              Your network
            </span>
            <h1
              className="pl-display mt-5"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Connections.
            </h1>
            <p
              className="mt-4 text-lg"
              style={{ color: "var(--pl-ink-2)" }}
            >
              People you've connected with, plus pending requests in both
              directions.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
          {/* Tabs */}
          <div
            className="inline-flex items-center gap-1 p-1 rounded-full mb-10"
            style={{
              background: "var(--pl-surface)",
              boxShadow: "inset 0 0 0 1px var(--pl-line)",
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              const count = connections[tab]?.length || 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2"
                  style={
                    isActive
                      ? {
                          background: "var(--pl-bg)",
                          color: "var(--pl-ink)",
                          boxShadow: "0 1px 2px rgba(10,10,10,0.06)",
                        }
                      : {
                          color: "var(--pl-ink-2)",
                          background: "transparent",
                        }
                  }
                >
                  {TAB_LABELS[tab]}
                  {count > 0 && (
                    <span
                      className="text-xs tabular-nums px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isActive
                          ? "var(--pl-accent-soft)"
                          : "var(--pl-bg)",
                        color: isActive
                          ? "var(--pl-accent-hover)"
                          : "var(--pl-ink-3)",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <span
                className="h-6 w-6 rounded-full animate-spin"
                style={{
                  border: "2px solid var(--pl-line)",
                  borderTopColor: "var(--pl-ink)",
                }}
              />
              <p className="text-sm" style={{ color: "var(--pl-ink-3)" }}>
                Loading connections…
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeTab === "incoming" &&
                renderList(connections.incoming, "pending_received")}
              {activeTab === "connected" &&
                renderList(connections.connected, "connected")}
              {activeTab === "sent" &&
                renderList(connections.sent, "pending_sent")}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ConnectionsPage;
