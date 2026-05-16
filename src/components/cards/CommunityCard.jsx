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
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameModal, setRenameModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

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
    } catch {
      /* api interceptor surfaces the toast */
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
        className="relative pl-card pl-card-hover cursor-pointer p-5"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <h2
            className="font-semibold text-base leading-snug truncate"
            style={{ color: "var(--pl-ink)", letterSpacing: "-0.01em" }}
          >
            {community.name}
          </h2>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={
                community.isPrivate
                  ? {
                      background: "rgba(220, 38, 38, 0.08)",
                      color: "#dc2626",
                    }
                  : {
                      background: "rgba(22, 163, 74, 0.1)",
                      color: "#16a34a",
                    }
              }
            >
              {community.isPrivate ? "Private" : "Public"}
            </span>

            {community.isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                className="rounded-md w-7 h-7 flex items-center justify-center transition"
                style={{ color: "var(--pl-ink-3)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--pl-surface)";
                  e.currentTarget.style.color = "var(--pl-ink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--pl-ink-3)";
                }}
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
            className="absolute right-5 top-14 rounded-xl w-44 z-50 overflow-hidden"
            style={{
              background: "white",
              boxShadow:
                "inset 0 0 0 1px var(--pl-line-2), 0 16px 36px -16px rgba(10,10,10,0.2)",
            }}
          >
            <button
              onClick={() => {
                setRenameModal(true);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm transition"
              style={{ color: "var(--pl-ink)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--pl-surface)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Rename community
            </button>
            <button
              onClick={() => {
                setDeleteModal(true);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm transition"
              style={{ color: "#dc2626" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(220,38,38,0.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Delete community
            </button>
          </div>
        )}

        {/* DESCRIPTION */}
        <p
          className="text-sm mb-4 line-clamp-2 leading-relaxed"
          style={{ color: "var(--pl-ink-2)" }}
        >
          {community.description || (
            <span className="italic" style={{ color: "var(--pl-ink-3)" }}>
              No description provided
            </span>
          )}
        </p>

        {/* MEMBERS */}
        <div
          className="flex items-center gap-1.5 text-xs mb-4"
          style={{ color: "var(--pl-ink-3)" }}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.7}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a4 4 0 00-5-4m-4 6H2v-2a4 4 0 015-4m4 0a4 4 0 100-8 4 4 0 010 8zm6-8a3 3 0 11-6 0 3 3 0 016 0zM7 8a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {community.memberCount || 0} member
          {(community.memberCount || 0) === 1 ? "" : "s"}
        </div>

        {/* ACTION BUTTON */}
        {mode === "discover" && (
          <>
            {community.isOwner ? (
              <button className="pl-btn w-full justify-center" style={{ fontSize: 13 }}>
                Open
                <span className="arrow">→</span>
              </button>
            ) : community.isPrivate ? (
              <button
                disabled
                className="w-full py-2 text-sm rounded-xl cursor-not-allowed"
                style={{
                  background: "var(--pl-surface)",
                  color: "var(--pl-ink-3)",
                  boxShadow: "inset 0 0 0 1px var(--pl-line)",
                }}
              >
                Private
              </button>
            ) : joined ? (
              <button className="pl-btn w-full justify-center" style={{ fontSize: 13 }}>
                Open
                <span className="arrow">→</span>
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={loading}
                className="pl-btn-secondary w-full justify-center"
                style={{ fontSize: 13 }}
              >
                {loading ? "Joining…" : "Join community"}
              </button>
            )}
          </>
        )}

        {mode === "my" && (
          <button className="pl-btn w-full justify-center" style={{ fontSize: 13 }}>
            Open
            <span className="arrow">→</span>
          </button>
        )}

        {/* OWNER TAG */}
        {community.isOwner && (
          <span
            className="absolute bottom-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "var(--pl-accent-soft)",
              color: "var(--pl-accent-hover)",
            }}
          >
            Owner
          </span>
        )}
      </div>

      <RenameCommunityModal
        isOpen={renameModal}
        onClose={() => setRenameModal(false)}
        communityId={community._id}
        currentName={community.name}
        onSuccess={(newName) => {
          community.name = newName;
        }}
      />

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
