import api from "../../api/api";
import { useState } from "react";

const DeleteCommunityModal = ({
  isOpen,
  onClose,
  communityId,
  onDeleteSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      await api.delete(`/community/${communityId}`);

      onDeleteSuccess(communityId); // 🔥 update parent
      onClose(); // 🔥 close modal
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-red-600 mb-3">
          Delete Community
        </h2>

        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete this community?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCommunityModal;
