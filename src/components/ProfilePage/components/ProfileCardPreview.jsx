import SkillCard from "../components/SkillCard";
import { calculateProfileLevel } from "../../utils/profileLevel";

const ProfileCardPreview = ({ user, skills, onEdit }) => {
  const profileLevel = calculateProfileLevel(user.skills || []);

  return (
    <section>
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold">How others see you</h2>
        <button onClick={onEdit} className="text-indigo-600 text-sm">
          Customize Card
        </button>
      </div>

      <div className="max-w-sm">
        <SkillCard
          name={user.name}
          dept={user.department}
          year={user.year}
          profileLevel={profileLevel}
          skills={skills}
          avatarSeed={user.avatarSeed}
        />
      </div>
    </section>
  );
};

export default ProfileCardPreview;
