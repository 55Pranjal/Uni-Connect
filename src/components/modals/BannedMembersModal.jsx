import { useEffect, useState } from "react";
import api from "../../api/api";

const BannedMembersModal = ({ isOpen, onClose, communityId, myRole }) => {
  const [banned, setBanned] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchBanned = async () => {
      try {
        const res = await api.get(`/community/${communityId}/banned`);
        setBanned(res.data);
      } catch (err) {
        console.error("Failed to fetch banned users:", err);
      }
    };

    fetchBanned();
  }, [isOpen, communityId]);

  const handleUnban = async (userId) => {
    try {
      await api.post(`/community/${communityId}/unban/${userId}`);

      setBanned((prev) => prev.filter((m) => m.userId._id !== userId));
    } catch {
      /* api interceptor surfaces the toast */
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Banned Members</h2>

        {banned.length === 0 ? (
          <p className="text-slate-500 text-sm">No banned users</p>
        ) : (
          <div className="space-y-3">
            {banned.map((member) => (
              <>
                <div
                  key={member._id}
                  className="flex justify-between items-center border p-3 rounded-xl"
                >
                  <span>{member.userId?.name}</span>
                  <button
                    disabled={myRole !== "admin"}
                    onClick={() => handleUnban(member.userId._id)}
                    className={`text-sm ${
                      myRole === "admin"
                        ? "text-green-600 hover:underline"
                        : "text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Unban
                  </button>
                </div>
              </>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-slate-200 rounded-xl hover:bg-slate-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BannedMembersModal;
