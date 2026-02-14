import { getAvatarUrl } from "../../utils/avatar";
import { calculateProfileLevel } from "../../utils/profileLevel";
import { useNavigate } from "react-router-dom";

const ProfileHeader = ({ user, onEdit }) => {
  const navigate = useNavigate();
  const avatarUrl = getAvatarUrl(user.avatarSeed);
  const profileLevel = calculateProfileLevel(user.skills || []);

  return (
    <section className="flex items-center gap-5">
      <img
        src={avatarUrl}
        alt={user.name}
        className="w-20 h-20 rounded-full ring-2 ring-indigo-500 bg-white"
      />

      <div className="flex-1">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-slate-500">
          {user.department} • {user.year}
        </p>
        <p className="text-sm text-indigo-600 font-semibold">
          Profile Level: Lv. {profileLevel}
        </p>
      </div>

      <div className="flex flex-col">
        <button onClick={onEdit} className="text-indigo-600 text-sm mb-3">
          Edit
        </button>

        <button
          onClick={() => navigate("/connections")}
          className="text-center"
        >
          <p className="text-sm text-slate-500">Connects</p>
          <p className="text-2xl font-bold text-indigo-600">
            {user.connectionsCount}
          </p>
        </button>
      </div>
    </section>
  );
};

export default ProfileHeader;
