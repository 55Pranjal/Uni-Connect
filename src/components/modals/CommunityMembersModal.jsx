import { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import KickConfirmationModal from "../modals/KickConfirmationModal";
import BanConfirmationModal from "../modals/BanConfirmationModal";
import MuteConfirmationModal from "../modals/MuteConfirmationModal";

const CommunityMembersModal = ({
  isOpen,
  onClose,
  communityId,
  currentUserId,
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [kickTarget, setKickTarget] = useState(null);
  const [banTarget, setBanTarget] = useState(null);
  const [muteTarget, setMuteTarget] = useState(null);

  const currentId = currentUserId?.toString();

  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/community/${communityId}/members`);
        setMembers(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isOpen, communityId]);

  /* ================= CURRENT USER MEMBERSHIP ================= */

  const currentUserMembership = useMemo(() => {
    return members.find((m) => m.userId?._id?.toString() === currentId);
  }, [members, currentId]);

  const isCurrentUserAdminOrOwner =
    currentUserMembership?.role === "admin" ||
    currentUserMembership?.role === "owner";

  /* ================= MEMBER REMOVAL (KICK / BAN) ================= */

  const handleRemoveMember = (userId) => {
    const id = userId?.toString();

    setMembers((prev) =>
      prev.filter((member) => member.userId?._id?.toString() !== id),
    );
  };

  /* ================= MUTE UPDATE ================= */

  const handleMuteSuccess = (userId) => {
    const id = userId?.toString();

    setMembers((prev) =>
      prev.map((member) =>
        member.userId?._id?.toString() === id
          ? { ...member, status: "muted" }
          : member,
      ),
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Community Members</h2>

          {loading ? (
            <p className="text-slate-500">Loading members...</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const memberId = member.userId?._id?.toString();

                const isSelf = memberId === currentId;

                const isOwner = member.role === "owner";

                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 rounded-xl border"
                  >
                    {/* MEMBER INFO */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-200 rounded-full flex items-center justify-center font-semibold">
                        {member.userId?.name?.charAt(0)}
                      </div>

                      <span className="font-medium">
                        {member.userId?.name}

                        {isSelf && (
                          <span className="text-xs text-slate-400 ml-2">
                            (You)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2">
                      {/* ROLE BADGE */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          member.role === "owner"
                            ? "bg-purple-100 text-purple-600"
                            : member.role === "admin"
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {member.role}
                      </span>

                      {/* MUTED BADGE */}
                      {member.status === "muted" && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          muted
                        </span>
                      )}

                      {/* ADMIN ACTIONS */}
                      {isCurrentUserAdminOrOwner && !isSelf && !isOwner && (
                        <>
                          <button
                            onClick={() => setKickTarget(member)}
                            className="text-red-500 text-xs font-medium hover:underline"
                          >
                            Kick
                          </button>

                          <button
                            onClick={() => setBanTarget(member)}
                            className="text-red-600 text-xs font-medium hover:underline"
                          >
                            Ban
                          </button>

                          {member.status !== "muted" && (
                            <button
                              onClick={() => setMuteTarget(member)}
                              className="text-yellow-600 text-xs font-medium hover:underline"
                            >
                              Mute
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 bg-slate-200 rounded-xl hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* KICK MODAL */}
      <KickConfirmationModal
        isOpen={!!kickTarget}
        onClose={() => setKickTarget(null)}
        communityId={communityId}
        member={kickTarget}
        onSuccess={handleRemoveMember}
      />

      {/* BAN MODAL */}
      <BanConfirmationModal
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        communityId={communityId}
        member={banTarget}
        onSuccess={handleRemoveMember}
      />

      {/* MUTE MODAL */}
      <MuteConfirmationModal
        isOpen={!!muteTarget}
        onClose={() => setMuteTarget(null)}
        communityId={communityId}
        member={muteTarget}
        onSuccess={handleMuteSuccess}
      />
    </>
  );
};

export default CommunityMembersModal;
