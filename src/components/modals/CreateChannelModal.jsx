import { useState } from "react";

const CreateChannelModal = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState({
    name: "",
    type: "text",
    skillTag: "",
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) return;

    onCreate(form);
    setForm({ name: "", type: "text", skillTag: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-96 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Create Channel</h3>

        <input
          type="text"
          placeholder="Channel name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full mb-3 px-3 py-2 border rounded-lg"
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full mb-3 px-3 py-2 border rounded-lg"
        >
          <option value="text">Text</option>
          <option value="announcement">Announcement</option>
        </select>

        <input
          type="text"
          placeholder="Skill tag (optional)"
          value={form.skillTag}
          onChange={(e) =>
            setForm({
              ...form,
              skillTag: e.target.value,
            })
          }
          className="w-full mb-4 px-3 py-2 border rounded-lg"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
