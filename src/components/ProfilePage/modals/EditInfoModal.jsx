import BaseModal from "./BaseModal";

const EditInfoModal = ({ form, setForm, onSave, onClose }) => {
  return (
    <BaseModal title="Edit Info" onSave={onSave} onClose={onClose}>
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border rounded-lg p-3"
      />

      <input
        type="text"
        placeholder="Department"
        value={form.department}
        onChange={(e) => setForm({ ...form, department: e.target.value })}
        className="w-full border rounded-lg p-3"
      />

      <input
        type="text"
        placeholder="Year"
        value={form.year}
        onChange={(e) => setForm({ ...form, year: e.target.value })}
        className="w-full border rounded-lg p-3"
      />
    </BaseModal>
  );
};

export default EditInfoModal;
