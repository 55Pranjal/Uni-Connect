import { useEffect, useState } from "react";
import api from "../../api/api";

const CommunityMembersModal = ({ isOpen, onClose, communityId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/community/${communityId}/members`);
        setMembers(res.data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isOpen, communityId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Community Members</h2>

        {loading ? (
          <p className="text-slate-500">Loading members...</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 rounded-xl border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-200 rounded-full flex items-center justify-center font-semibold">
                    {member.userId?.name?.charAt(0)}
                  </div>
                  <span className="font-medium">{member.userId?.name}</span>
                </div>

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
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-slate-200 rounded-xl hover:bg-slate-300 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CommunityMembersModal;
