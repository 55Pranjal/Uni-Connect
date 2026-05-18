import { useRef, useState } from "react";
import api from "../../api/api";
import useFocusTrap from "../../hooks/useFocusTrap";

const DeleteChannelModal = ({
  isOpen,
  onClose,
  communityId,
  channel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  useFocusTrap(modalRef, onClose, isOpen && !!channel);

  if (!isOpen || !channel) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      await api.delete(`/community/${communityId}/channel/${channel._id}`);

      onSuccess(channel._id);
      onClose();
    } catch {
      /* api interceptor surfaces the toast */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Delete Channel
        </h3>

        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">#{channel.name}</span>? This action
          cannot be undone.
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
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChannelModal;
