import { useState } from "react";
import api from "../../api/api";

const KickConfirmationModal = ({
  isOpen,
  onClose,
  communityId,
  member,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !member) return null;

  const handleKick = async () => {
    try {
      setLoading(true);

      await api.delete(
        `/community/${communityId}/members/${member.userId._id}`,
      );

      onSuccess(member.userId._id); // notify parent
      onClose();
    } catch (err) {
      console.error("Failed to kick member:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold mb-2 text-red-600">
          Remove Member
        </h3>

        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to remove{" "}
          <span className="font-semibold">{member.userId?.name}</span> from this
          community?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
          >
            Cancel
          </button>

          <button
            onClick={handleKick}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? "Removing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KickConfirmationModal;
