import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "./Navbar";
import CommunityCard from "../components/cards/CommunityCard";

const CommunityPage = () => {
  const navigate = useNavigate();

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await api.get("/community/my");
        setCommunities(res.data);
      } catch (err) {
        console.error("Failed to fetch communities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    const handleDelete = (e) => {
      const id = e.detail;

      setCommunities((prev) =>
        prev.filter((community) => community._id !== id),
      );
    };

    window.addEventListener("communityDeleted", handleDelete);

    return () => window.removeEventListener("communityDeleted", handleDelete);
  }, []);

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">My Communities</h1>

          <button
            onClick={() => navigate("/create-community")}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            + Create Community
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-500 mt-12">
            <p className="text-lg mb-2">No communities yet.</p>
            <p>Create your first community and start building 🚀</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((community) => (
              <CommunityCard
                key={community._id}
                community={community}
                mode="my" // 🔥 Important
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default CommunityPage;
