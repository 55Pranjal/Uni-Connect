import { useState, useEffect } from "react";
import api from "../../api/api";

const RenameChannelModal = ({
  isOpen,
  onClose,
  communityId,
  channel,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (channel) {
      setName(channel.name);
    }
  }, [channel]);

  if (!isOpen || !channel) return null;

  const handleRename = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);

      await api.patch(`/community/${communityId}/channel/${channel._id}`, {
        name,
      });

      onSuccess(channel._id, name.trim());
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rename channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Rename Channel</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
          placeholder="Enter new channel name"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleRename}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Renaming..." : "Rename"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameChannelModal;
