import React from "react";
import { getAvatarUrl } from "../../utils/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api/api";
import TierBadge from "../TierBadge";

const SkillCard = ({
  userId,
  name,
  dept,
  year,
  level = 1,
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
  const { token } = useAuth();
  const { confirm } = useToast();
  const visibleSkills = skills.slice(0, 3);

  const handleChat = async () => {
    try {
      const res = await api.post(`/dm/${userId}`);
      navigate(`/dm/${res.data.conversationId}`);
    } catch (err) {
      console.error("Failed to open DM:", err);
    }
  };

  const action = () => {
    if (isSelf) return null;

    switch (connectionStatus) {
      case "connected":
        return (
          <div className="flex gap-2 items-center">
            <button
              onClick={handleChat}
              disabled={!token}
              className="pl-btn"
              style={{ padding: "0.5rem 0.95rem", fontSize: 13 }}
            >
              Message
              <span className="arrow">→</span>
            </button>
            {onRemove && (
              <button
                onClick={async () => {
                  const ok = await confirm({
                    title: "Remove this connection?",
                    message: "You can reconnect later.",
                    confirmText: "Remove",
                    danger: true,
                  });
                  if (ok) onRemove(userId);
                }}
                aria-label={`Remove ${name} from your connections`}
                title="Remove"
                className="pl-btn-ghost"
                style={{
                  padding: "0.4rem 0.55rem",
                  fontSize: 13,
                  color: "var(--pl-ink-3)",
                }}
              >
                ✕
              </button>
            )}
          </div>
        );

      case "pending_sent":
        return (
          <span
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              background: "var(--pl-surface)",
              color: "var(--pl-ink-3)",
              boxShadow: "inset 0 0 0 1px var(--pl-line)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--pl-accent)" }}
            />
            Pending
          </span>
        );

      case "pending_received":
        return (
          <div className="flex gap-2">
            {onAccept && (
              <button
                onClick={() => onAccept(userId)}
                className="pl-btn"
                style={{ padding: "0.5rem 0.95rem", fontSize: 13 }}
              >
                Accept
              </button>
            )}
            {onReject && (
              <button
                onClick={() => onReject(userId)}
                className="pl-btn-secondary"
                style={{ padding: "0.5rem 0.95rem", fontSize: 13 }}
              >
                Decline
              </button>
            )}
          </div>
        );

      default:
        return onConnect ? (
          <button
            onClick={() => onConnect(userId)}
            className="pl-btn-secondary"
            style={{ padding: "0.5rem 0.95rem", fontSize: 13 }}
          >
            Connect
          </button>
        ) : null;
    }
  };

  return (
    <article className="pl-card pl-card-hover overflow-hidden">
      <div className="flex items-start gap-3 mb-5">
        <img
          src={avatarUrl}
          alt={name}
          className="w-12 h-12 rounded-full bg-neutral-100 object-cover shrink-0"
          style={{ boxShadow: "inset 0 0 0 1px var(--pl-line)" }}
        />
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold truncate"
            style={{ letterSpacing: "-0.01em", color: "var(--pl-ink)" }}
          >
            {name}
          </h3>
          <p
            className="text-xs mt-0.5 truncate"
            style={{ color: "var(--pl-ink-3)" }}
          >
            {dept || "—"}
            {year ? ` · Year ${year}` : ""}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{
                background: "var(--pl-accent-soft)",
                color: "var(--pl-accent-hover)",
              }}
            >
              Lv {level}
            </span>
            <TierBadge level={level} size="sm" />
          </div>
        </div>
      </div>

      {visibleSkills.length > 0 ? (
        <div className="space-y-2.5 mb-5">
          {visibleSkills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center gap-3 text-sm"
            >
              <span
                className="flex-1 truncate"
                style={{ color: "var(--pl-ink-2)" }}
              >
                {skill.name}
              </span>
              <div
                className="h-1.5 rounded-full flex-shrink-0"
                style={{
                  width: 70,
                  background: "var(--pl-line)",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (skill.level / 10) * 100)}%`,
                    background: "var(--pl-ink)",
                  }}
                />
              </div>
              <span
                className="text-[11px] tabular-nums shrink-0"
                style={{
                  color: "var(--pl-ink-3)",
                  width: 16,
                  textAlign: "right",
                }}
              >
                {skill.level}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="text-xs mb-5 italic"
          style={{ color: "var(--pl-ink-3)" }}
        >
          No featured skills yet.
        </p>
      )}

      {!isSelf && (
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid var(--pl-line)" }}
        >
          {action()}
          <button
            onClick={() => navigate(`/public/${userId}`)}
            className="text-xs font-medium"
            style={{ color: "var(--pl-ink-3)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--pl-ink)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--pl-ink-3)")
            }
          >
            View profile →
          </button>
        </div>
      )}
    </article>
  );
};

export default SkillCard;
