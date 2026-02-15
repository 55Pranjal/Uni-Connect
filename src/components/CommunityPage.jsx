import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "./Navbar";

const CommunityPage = () => {
  const navigate = useNavigate();

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH MY COMMUNITIES ================= */
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

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Communities</h1>

          <button
            onClick={() => navigate("/create-community")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
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
              <div
                key={community._id}
                onClick={() => navigate(`/community/${community._id}`)}
                className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md cursor-pointer transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">{community.name}</h2>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      community.isPrivate
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {community.isPrivate ? "Private" : "Public"}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {community.description || "No description provided."}
                </p>

                <div className="text-xs text-slate-500">
                  👥 {community.memberCount || 0} members
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default CommunityPage;
