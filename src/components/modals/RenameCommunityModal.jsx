import { useState, useEffect } from "react";
import api from "../../api/api";
import { useToast } from "../../context/ToastContext";

const RenameCommunityModal = ({
  isOpen,
  onClose,
  communityId,
  currentName,
  onSuccess,
}) => {
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentName || "");
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleRename = async () => {
    if (!name.trim()) {
      notify({ title: "Community name cannot be empty", severity: "error" });
      return;
    }

    try {
      setLoading(true);

      const res = await api.patch(`/community/${communityId}`, {
        name: name.trim(),
      });

      onSuccess(res.data.community.name);
      onClose();
    } catch {
      /* api interceptor surfaces the toast */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Rename Community</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          placeholder="Community name"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
          >
            Cancel
          </button>

          <button
            onClick={handleRename}
            disabled={loading}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameCommunityModal;
