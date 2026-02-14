const BaseModal = ({
  title,
  children,
  onClose,
  onSave,
  saveLabel = "Save",
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-bold">{title}</h3>

        {children}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>
          {onSave && (
            <button
              onClick={onSave}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              {saveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
