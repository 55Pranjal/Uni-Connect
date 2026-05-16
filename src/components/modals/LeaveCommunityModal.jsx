import { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const LeaveCommunityModal = ({ isOpen, onClose, communityId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLeave = async () => {
    try {
      setLoading(true);

      await api.post(`/community/${communityId}/leave`);

      navigate("/");
    } catch {
      /* api interceptor surfaces the toast */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Leave Community
        </h3>

        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to leave this community?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleLeave}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            {loading ? "Leaving..." : "Leave"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveCommunityModal;
