const ProfileSkills = ({ skills, onEdit }) => (
  <section>
    <h2 className="text-lg font-bold mb-3">Skills</h2>

    <div className="grid sm:grid-cols-2 gap-4">
      {skills.map((skill) => (
        <div
          key={skill.name}
          className="border rounded-xl p-4 flex justify-between"
        >
          <span>{skill.name}</span>
          <span className="font-semibold">Lv. {skill.level}</span>
        </div>
      ))}
    </div>

    <button onClick={onEdit} className="text-indigo-600 text-sm mt-4">
      View all skills
    </button>
  </section>
);

export default ProfileSkills;
