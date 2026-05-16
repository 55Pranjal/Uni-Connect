import api from "../../api/api";

const MuteConfirmationModal = ({
  isOpen,
  onClose,
  communityId,
  member,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const handleMute = async () => {
    try {
      await api.post(`/community/${communityId}/mute/${member.userId._id}`);

      onSuccess(member.userId._id);
      onClose();
    } catch {
      /* api interceptor surfaces the toast */
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
      <div className="bg-white p-6 rounded-xl w-80">
        <h3 className="font-semibold text-yellow-600 mb-3">Mute Member</h3>

        <p className="text-sm mb-4">
          Mute <strong>{member.userId.name}</strong>?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">
            Cancel
          </button>

          <button
            onClick={handleMute}
            className="px-3 py-1 bg-yellow-600 text-white rounded"
          >
            Mute
          </button>
        </div>
      </div>
    </div>
  );
};

export default MuteConfirmationModal;
