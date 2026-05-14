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

      <main className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-16 pl-page">
        {/* HEADER */}
        <div className="pl-reveal flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
          <div className="max-w-2xl">
            <span className="pl-eyebrow">
              <span className="dot" />
              Your communities
            </span>
            <h1
              className="pl-display mt-5"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              Communities.
            </h1>
            <p
              className="mt-4 text-lg"
              style={{ color: "var(--pl-ink-2)" }}
            >
              Course groups, clubs, project channels — your private corners of
              campus.
            </p>
          </div>
          <button
            onClick={() => navigate("/create-community")}
            className="pl-btn shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create community
          </button>
        </div>

        {/* SEARCH */}
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
              placeholder="Search your communities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-3.5 bg-transparent outline-none text-base"
              style={{ color: "var(--pl-ink)" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="pl-btn-ghost mr-2"
                style={{ padding: "0.4rem 0.6rem", fontSize: 12 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
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
              Loading communities…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <p
              className="pl-display text-2xl"
              style={{ color: "var(--pl-ink)" }}
            >
              {search ? "No matches." : "No communities yet."}
            </p>
            <p
              className="text-sm mt-2"
              style={{ color: "var(--pl-ink-3)" }}
            >
              {search
                ? "Try a different keyword."
                : "Create your first community and start building."}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/create-community")}
                className="pl-btn mt-6"
              >
                Create your first
                <span className="arrow">→</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((community, i) => (
              <div
                key={community._id}
                className="pl-reveal"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CommunityCard community={community} mode="my" />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default CommunityPage;
