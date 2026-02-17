import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import SkillCard from "../components/cards/SkillCard.jsx";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Home = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token, loading: authLoading } = useAuth(); // 🔥 single source

  useEffect(() => {
    // Wait for auth to resolve first
    if (authLoading) return;

    if (!token) {
      setConnections([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get(`${BACKEND_URL}/api/connections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const connected = res.data.connected || [];
        setConnections(connected);
      })
      .catch((err) => {
        console.error("Failed to fetch connections:", err);
        setConnections([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, authLoading]);

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Your Connections
        </h2>
        <p className="text-slate-500 mb-6">
          People you’re currently chatting or collaborating with
        </p>

        {/* AUTH LOADING */}
        {authLoading && (
          <p className="text-slate-500">Checking authentication...</p>
        )}

        {/* DATA LOADING */}
        {!authLoading && loading && (
          <p className="text-slate-500">Loading connections...</p>
        )}

        {/* EMPTY STATE */}
        {!authLoading && !loading && connections.length === 0 && (
          <p className="text-slate-500">You don’t have any connections yet.</p>
        )}

        {/* CONNECTIONS GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => {
            const user = conn.user || conn;

            return (
              <SkillCard
                key={user._id}
                userId={user._id}
                name={user.name}
                dept={user.department}
                year={user.year}
                avatarSeed={user.avatarSeed || user._id}
                skills={user.skills || []}
                connectionStatus="connected"
              />
            );
          })}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Home;
