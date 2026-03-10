import api from "../../api/api";

const BanConfirmationModal = ({
  isOpen,
  onClose,
  communityId,
  member,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const handleBan = async () => {
    try {
      await api.post(`/community/${communityId}/ban/${member.userId._id}`);

      onSuccess(member.userId._id);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to ban user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
      <div className="bg-white p-6 rounded-xl w-80">
        <h3 className="font-semibold text-red-600 mb-3">Ban Member</h3>

        <p className="text-sm mb-4">
          Are you sure you want to ban <strong>{member.userId.name}</strong>?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">
            Cancel
          </button>

          <button
            onClick={handleBan}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Ban
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanConfirmationModal;
