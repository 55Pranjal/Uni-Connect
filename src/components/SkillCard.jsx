import React from "react";
import { getAvatarUrl } from "../utils/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

const SkillCard = ({
  userId,
  name,
  dept,
  year,
  profileLevel,
  skills = [],
  avatarSeed,
  connectionStatus = "none",
  isSelf = false,
  onConnect,
  onAccept,
  onReject,
  onRemove,
}) => {
  const avatarUrl = getAvatarUrl(avatarSeed);
  const navigate = useNavigate();
  const { token } = useAuth(); // 🔥 single source of truth

  const visibleSkills = skills.slice(0, 3);

  const handleChat = async () => {
    try {
      const res = await api.post(`/dm/${userId}`);

      navigate(`/dm/${res.data.conversationId}`);
    } catch (err) {
      console.error("Failed to open DM:", err);
    }
  };

  /* ================= ACTION LOGIC ================= */
  const renderActionButton = () => {
    if (isSelf) return null;

    switch (connectionStatus) {
      case "connected":
        return (
          <div className="flex gap-2">
            <button
              onClick={handleChat}
              disabled={!token}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
            >
              Chat
            </button>

            {onRemove && (
              <button
                onClick={() => {
                  const confirm = window.confirm("Remove this connection?");
                  if (confirm) onRemove(userId);
                }}
                className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600"
              >
                Remove
              </button>
            )}
          </div>
        );

      case "pending_sent":
        return (
          <button
            disabled
            className="px-4 py-2 text-sm rounded-lg bg-slate-300 text-slate-600 cursor-not-allowed"
          >
            Pending
          </button>
        );

      case "pending_received":
        return (
          <div className="flex gap-2">
            {onAccept && (
              <button
                onClick={() => onAccept(userId)}
                className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white"
              >
                Accept
              </button>
            )}

            {onReject && (
              <button
                onClick={() => onReject(userId)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600"
              >
                Reject
              </button>
            )}
          </div>
        );

      default:
        return onConnect ? (
          <button
            onClick={() => onConnect(userId)}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white"
          >
            Connect
          </button>
        ) : null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-200 p-5 shadow-sm hover:shadow-md transition">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={name}
            className="w-12 h-12 rounded-full ring-2 ring-indigo-500 bg-white"
          />
          <div>
            <h3 className="font-semibold text-slate-800">{name}</h3>
            <p className="text-xs text-slate-500">
              {dept} • {year}
            </p>
          </div>
        </div>

        <p className="text-lg font-extrabold text-indigo-600">
          Lv. {profileLevel}
        </p>
      </div>

      {/* SKILLS */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {visibleSkills.map((skill) => (
          <div
            key={skill.name}
            className="bg-white rounded-xl border border-slate-200 py-2"
          >
            <p className="text-xs truncate">{skill.name}</p>
            <p className="text-lg font-bold">Lv. {skill.level}</p>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      {!isSelf && (
        <div className="flex justify-between items-center mt-5">
          {renderActionButton()}

          <button
            onClick={() => navigate(`/public/${userId}`)}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillCard;
