import BaseModal from "./BaseModal";

const SkillSelectModal = ({
  title,
  max,
  skills,
  selected,
  setSelected,
  onSave,
  onClose,
}) => {
  return (
    <BaseModal title={title} onSave={onSave} onClose={onClose}>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {skills.map((skill) => {
          const isSelected = selected.some((s) => s.name === skill.name);

          return (
            <label
              key={skill.name}
              className="flex justify-between items-center bg-slate-50 border rounded-lg px-4 py-2"
            >
              <span>{skill.name}</span>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  if (isSelected) {
                    setSelected((prev) =>
                      prev.filter((s) => s.name !== skill.name)
                    );
                  } else if (selected.length < max) {
                    setSelected((prev) => [...prev, skill]);
                  }
                }}
                className="accent-indigo-600"
              />
            </label>
          );
        })}
      </div>
    </BaseModal>
  );
};

export default SkillSelectModal;
