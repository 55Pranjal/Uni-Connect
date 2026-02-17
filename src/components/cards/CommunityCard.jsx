import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useState } from "react";

const CommunityCard = ({ community, mode = "discover" }) => {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(
    mode === "my" ? true : community.isJoined,
  );
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.stopPropagation();

    if (joined || community.isPrivate) return;

    try {
      setLoading(true);
      await api.post(`/community/${community._id}/join`);
      setJoined(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join community");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    navigate(`/community/${community._id}`);
  };

  return (
    <div
      onClick={handleOpen}
      className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">{community.name}</h2>

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

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4">
        {community.description || "No description provided"}
      </p>

      {/* Members */}
      <div className="text-xs text-slate-500 mb-4">
        👥 {community.memberCount || 0} members
      </div>

      {/* Action Button */}
      {mode === "discover" && (
        <>
          {community.isOwner ? (
            <button className="w-full py-2 text-sm bg-indigo-600 text-white rounded-lg">
              Open
            </button>
          ) : community.isPrivate ? (
            <button
              disabled
              className="w-full py-2 text-sm bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Private
            </button>
          ) : joined ? (
            <button className="w-full py-2 text-sm bg-indigo-600 text-white rounded-lg">
              Open
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          )}
        </>
      )}

      {mode === "my" && (
        <button className="w-full py-2 text-sm bg-indigo-600 text-white rounded-lg">
          Open
        </button>
      )}

      {community.isOwner && (
        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
          Owner
        </span>
      )}
    </div>
  );
};

export default CommunityCard;
