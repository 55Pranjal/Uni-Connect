import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useState, useEffect } from "react";
import RenameCommunityModal from "../modals/RenameCommunityModal";
import DeleteCommunityModal from "../modals/DeleteCommunityModal";

const CommunityCard = ({ community, mode = "discover" }) => {
  const navigate = useNavigate();

  const [joined, setJoined] = useState(
    mode === "my" ? true : community.isJoined,
  );

  const [loading, setLoading] = useState(false);

  /* OWNER MENU STATES */
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameModal, setRenameModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  /* CLOSE MENU ON OUTSIDE CLICK */
  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);

    window.addEventListener("click", closeMenu);

    return () => window.removeEventListener("click", closeMenu);
  }, []);

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
    <>
      <div
        onClick={handleOpen}
        className="relative bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-3">
          <h2 className="font-semibold text-lg">{community.name}</h2>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                community.isPrivate
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {community.isPrivate ? "Private" : "Public"}
            </span>

            {/* OWNER MENU */}
            {community.isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ⋮
              </button>
            )}
          </div>
        </div>

        {/* OWNER DROPDOWN MENU */}
        {menuOpen && community.isOwner && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-6 top-14 bg-white border shadow-lg rounded-lg w-44 z-50"
          >
            <button
              onClick={() => {
                setRenameModal(true);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-100"
            >
              Rename Community
            </button>

            <button
              onClick={() => {
                setDeleteModal(true);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-slate-100"
            >
              Delete Community
            </button>
          </div>
        )}

        {/* DESCRIPTION */}
        <p className="text-sm text-slate-600 mb-4">
          {community.description || "No description provided"}
        </p>

        {/* MEMBERS */}
        <div className="text-xs text-slate-500 mb-4">
          👥 {community.memberCount || 0} members
        </div>

        {/* ACTION BUTTON */}
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

        {/* OWNER TAG */}
        {community.isOwner && (
          <span className="absolute bottom-3 right-3 text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
            Owner
          </span>
        )}
      </div>

      {/* RENAME COMMUNITY MODAL */}
      <RenameCommunityModal
        isOpen={renameModal}
        onClose={() => setRenameModal(false)}
        communityId={community._id}
        currentName={community.name}
        onSuccess={(newName) => {
          community.name = newName;
        }}
      />

      {/* DELETE COMMUNITY MODAL */}
      <DeleteCommunityModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        communityId={community._id}
        onDeleteSuccess={(id) => {
          window.dispatchEvent(
            new CustomEvent("communityDeleted", { detail: id }),
          );
        }}
      />
    </>
  );
};

export default CommunityCard;
