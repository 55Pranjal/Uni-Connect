import BaseModal from "./BaseModal";

const EditAboutModal = ({ form, setForm, onSave, onClose }) => {
  return (
    <BaseModal title="Edit About" onSave={onSave} onClose={onClose}>
      <textarea
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        maxLength={200}
        placeholder="Short bio"
        className="w-full border rounded-lg p-3"
      />

      <input
        type="url"
        placeholder="GitHub link"
        value={form.github}
        onChange={(e) => setForm({ ...form, github: e.target.value })}
        className="w-full border rounded-lg p-3"
      />

      <input
        type="url"
        placeholder="LinkedIn link"
        value={form.linkedin}
        onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
        className="w-full border rounded-lg p-3"
      />
    </BaseModal>
  );
};

export default EditAboutModal;
