import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";
import { getAvatarUrl } from "../utils/avatar";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  sendCollabRequest,
  withdrawCollabRequest,
  removeCollaborator,
  getMyProjects,
  getProjectRoom,
} from "../api/projects";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const STATUS_OPTIONS = ["open", "in-progress", "completed"];
const ALL_TAGS = [
  "Web Dev", "Mobile", "AI/ML", "Data Science", "Blockchain",
  "IoT", "Game Dev", "DevOps", "UI/UX", "Research", "Open Source", "Hardware",
];

const STATUS_STYLES = {
  open: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "in-progress": "bg-amber-100 text-amber-700 border border-amber-200",
  completed: "bg-slate-100 text-slate-600 border border-slate-200",
};

const COLLAB_STYLES = {
  none: { label: "Collaborate", cls: "bg-violet-600 hover:bg-violet-700 text-white" },
  pending: { label: "Pending…", cls: "bg-slate-200 text-slate-500 cursor-not-allowed" },
  accepted: { label: "Collaborator ✓", cls: "bg-emerald-100 text-emerald-700 border border-emerald-300" },
};

const EMPTY_FORM = {
  title: "",
  description: "",
  tags: [],
  status: "open",
  techStack: "",
  repoUrl: "",
  liveUrl: "",
  rolesNeeded: "",
};

/* ═══════════════════════════════════════════════════════════════
   SMALL HELPERS
═══════════════════════════════════════════════════════════════ */
const Tag = ({ label }) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-medium">
    {label}
  </span>
);

const StatusBadge = ({ status }) => (
  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.open}`}>
    {status}
  </span>
);

const Spinner = ({ size = 5 }) => (
  <svg
    className={`animate-spin h-${size} w-${size} text-indigo-500`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   PROJECT CARD
═══════════════════════════════════════════════════════════════ */
const ProjectCard = ({ project, currentUserId, onOpen, onCollabToggle, onDelete, onEdit }) => {
  const isOwner = project.owner?._id === currentUserId || project.owner === currentUserId;

  const myRequest = project.collaborationRequests?.find(
    (r) => (r.user?._id || r.user) === currentUserId
  );
  const collabStatus = isOwner
    ? "owner"
    : myRequest?.status === "accepted"
    ? "accepted"
    : myRequest
    ? "pending"
    : "none";

  const ownerAvatarUrl = getAvatarUrl(project.owner?.avatarSeed || "default");

  return (
    <article
      onClick={() => onOpen(project)}
      className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl
                 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 4).map((t) => <Tag key={t} label={t} />)}
            {project.tags.length > 4 && (
              <span className="text-xs text-slate-400">+{project.tags.length - 4} more</span>
            )}
          </div>
        )}

        {/* Tech stack */}
        {project.techStack && (
          <p className="text-xs text-slate-400 truncate">
            <span className="font-medium text-slate-500">Stack: </span>{project.techStack}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2">
          {/* Owner + Collab count row */}
          <div className="flex items-center justify-between gap-2">
            {/* Owner */}
            <div
              className="flex items-center gap-2 min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={ownerAvatarUrl}
                alt={project.owner?.name || "Owner"}
                className="w-7 h-7 rounded-full ring-2 ring-indigo-200 flex-shrink-0"
              />
              <span className="text-xs font-medium text-slate-600 truncate">
                {project.owner?.name || "Unknown"}
              </span>
            </div>

            {/* Collaborators count chip */}
            {(() => {
              const count = project.collaborationRequests?.filter((r) => r.status === "accepted").length || 0;
              return count > 0 ? (
                <span
                  className="flex-shrink-0 text-xs bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-full font-medium border border-violet-200 flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-4m-4 6H2v-2a4 4 0 015-4m4 0a4 4 0 100-8 4 4 0 010 8zm6-8a3 3 0 11-6 0 3 3 0 016 0zM7 8a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {count}
                </span>
              ) : null;
            })()}
          </div>

          {/* Actions row */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {isOwner ? (
              <>
                <button
                  onClick={() => onEdit(project)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600
                             hover:bg-indigo-50 transition font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(project._id)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500
                             hover:bg-red-50 transition font-medium"
                >
                  Delete
                </button>
              </>
            ) : collabStatus !== "owner" ? (
              <button
                disabled={collabStatus === "pending" || collabStatus === "accepted"}
                onClick={() => onCollabToggle(project._id, myRequest?._id, collabStatus)}
                className={`w-full text-xs px-3 py-1.5 rounded-lg font-medium transition
                            ${COLLAB_STYLES[collabStatus]?.cls}`}
              >
                {COLLAB_STYLES[collabStatus]?.label}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROJECT DETAIL MODAL
═══════════════════════════════════════════════════════════════ */
const ProjectModal = ({ project, currentUserId, onClose, onCollabToggle, onEdit, onDelete, onRequestAction, onRemoveCollaborator, onOpenChat }) => {
  const overlayRef = useRef();
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError]     = useState("");

  if (!project) return null;

  const isOwner = project.owner?._id === currentUserId || project.owner === currentUserId;
  const myRequest = project.collaborationRequests?.find(
    (r) => (r.user?._id || r.user) === currentUserId
  );
  const collabStatus = isOwner
    ? "owner"
    : myRequest?.status === "accepted"
    ? "accepted"
    : myRequest
    ? "pending"
    : "none";

  const isMember = isOwner || collabStatus === "accepted";

  const pendingRequests = project.collaborationRequests?.filter((r) => r.status === "pending") || [];
  const acceptedCollabs = project.collaborationRequests?.filter((r) => r.status === "accepted") || [];

  // Room exists once the backend has created the community (first accept)
  const hasRoom = !!project.communityId;

  const handleChatClick = async () => {
    setChatError("");
    setChatLoading(true);
    try {
      await onOpenChat(project._id);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to open chat.";
      setChatError(msg);
    } finally {
      setChatLoading(false);
    }
  };

  const ownerAvatarUrl = getAvatarUrl(project.owner?.avatarSeed || "default");

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,30,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Gradient header */}
        <div className="h-2 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-6 md:p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>

          {/* Title + status */}
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <h2 className="text-2xl font-extrabold text-slate-800 flex-1">{project.title}</h2>
            <StatusBadge status={project.status} />
          </div>

          {/* Owner info */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
            <img src={ownerAvatarUrl} alt={project.owner?.name} className="w-10 h-10 rounded-full ring-2 ring-indigo-300" />
            <div>
              <p className="text-sm font-semibold text-slate-700">{project.owner?.name || "Unknown"}</p>
              <p className="text-xs text-slate-400">{project.owner?.department} {project.owner?.year && `• Year ${project.owner.year}`}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed mb-5">{project.description}</p>

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {project.tags.map((t) => <Tag key={t} label={t} />)}
            </div>
          )}

          {/* Meta grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-5 text-sm">
            {project.techStack && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Tech Stack</p>
                <p className="text-slate-700 font-medium">{project.techStack}</p>
              </div>
            )}
            {project.rolesNeeded && (
              <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                <p className="text-xs text-violet-400 font-medium uppercase tracking-wide mb-1">Roles Needed</p>
                <p className="text-slate-700 font-medium">{project.rolesNeeded}</p>
              </div>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-2
                           hover:bg-slate-100 transition text-indigo-600 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.23c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.08-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.06 1.82 2.79 1.29 3.47.99.1-.77.42-1.29.76-1.59-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Repository
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center gap-2
                           hover:bg-emerald-100 transition text-emerald-600 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Demo
              </a>
            )}
          </div>

          {/* Collaboration section (owner view) */}
          {isOwner && pendingRequests.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                  {pendingRequests.length}
                </span>
                Pending Collaboration Requests
              </h4>
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={getAvatarUrl(req.user?.avatarSeed || "default")}
                        alt={req.user?.name}
                        className="w-8 h-8 rounded-full ring-2 ring-amber-200"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{req.user?.name}</p>
                        <p className="text-xs text-slate-400">{req.user?.department}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onRequestAction(project._id, req._id, "accept")}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onRequestAction(project._id, req._id, "reject")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted collaborators */}
          {acceptedCollabs.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-4m-4 6H2v-2a4 4 0 015-4m4 0a4 4 0 100-8 4 4 0 010 8zm6-8a3 3 0 11-6 0 3 3 0 016 0zM7 8a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Collaborators
                <span className="ml-auto text-xs font-medium text-slate-400">{acceptedCollabs.length}</span>
              </h4>
              <div className="space-y-2">
                {acceptedCollabs.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between p-2.5 bg-violet-50 rounded-xl border border-violet-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getAvatarUrl(req.user?.avatarSeed || "default")}
                        alt={req.user?.name}
                        className="w-8 h-8 rounded-full ring-2 ring-violet-200 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{req.user?.name}</p>
                        <p className="text-xs text-slate-400">{req.user?.department}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => onRemoveCollaborator(project._id, req._id)}
                        title="Remove collaborator"
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition font-medium flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">

            {/* Open Chat — visible to owner + accepted collabs */}
            {isMember && (
              hasRoom ? (
                <button
                  onClick={handleChatClick}
                  disabled={chatLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                             bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold
                             text-sm hover:opacity-90 transition shadow-md disabled:opacity-60"
                >
                  {chatLoading ? (
                    <Spinner size={4} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                  Open Project Chat
                </button>
              ) : (
                <div className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat room opens once the first collaborator is accepted.
                </div>
              )
            )}

            {/* Error from chat open */}
            {chatError && (
              <p className="text-xs text-red-500 text-center -mt-1">{chatError}</p>
            )}

            <div className="flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  <button
                    onClick={() => { onClose(); onEdit(project); }}
                    className="flex-1 py-2.5 rounded-xl border border-indigo-200 text-indigo-600
                               hover:bg-indigo-50 transition font-medium text-sm"
                  >
                    Edit Project
                  </button>
                  <button
                    onClick={() => { onClose(); onDelete(project._id); }}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500
                               hover:bg-red-50 transition font-medium text-sm"
                  >
                    Delete Project
                  </button>
                </>
              ) : (
                <button
                  disabled={collabStatus === "pending" || collabStatus === "accepted"}
                  onClick={() => onCollabToggle(project._id, myRequest?._id, collabStatus)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition
                              ${collabStatus === "none"
                                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90 shadow-md"
                                : collabStatus === "pending"
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}
                >
                  {collabStatus === "none"
                    ? "🚀 Request to Collaborate"
                    : collabStatus === "pending"
                    ? "⏳ Request sent — waiting…"
                    : "✅ You're a collaborator!"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROJECT FORM MODAL  (create / edit)
═══════════════════════════════════════════════════════════════ */
const ProjectFormModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef();
  const isEdit = !!initial?._id;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleTag = (tag) =>
    set("tags", form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag]);

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    setError("");
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,30,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="h-2 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-800">
              {isEdit ? "Edit Project" : "🚀 Post a Project"}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4">{error}</p>
          )}

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Title *</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. AI-Powered Campus Navigation"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Tell students what this project is about, what problems it solves…"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
              <div className="mt-1 flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => set("status", s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition
                                ${form.status === s
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                                }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition
                                ${form.tags.includes(tag)
                                  ? "bg-violet-600 text-white border-violet-600"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-400"
                                }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tech Stack</label>
              <input
                value={form.techStack}
                onChange={(e) => set("techStack", e.target.value)}
                placeholder="React, Node.js, MongoDB…"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
              />
            </div>

            {/* Roles Needed */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Roles Needed</label>
              <input
                value={form.rolesNeeded}
                onChange={(e) => set("rolesNeeded", e.target.value)}
                placeholder="Frontend dev, ML engineer, UI designer…"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
              />
            </div>

            {/* Repo URL */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Repository URL</label>
                <input
                  value={form.repoUrl}
                  onChange={(e) => set("repoUrl", e.target.value)}
                  placeholder="https://github.com/…"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Live Demo URL</label>
                <input
                  value={form.liveUrl}
                  onChange={(e) => set("liveUrl", e.target.value)}
                  placeholder="https://myapp.vercel.app"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600
                         text-white font-semibold text-sm hover:opacity-90 transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <><Spinner size={4} /> Saving…</> : isEdit ? "Save Changes" : "Post Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const Projects = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [activeTab, setActiveTab] = useState("all"); // "all" | "mine"
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTag, setFilterTag] = useState("all");

  const [selectedProject, setSelectedProject] = useState(null); // detail modal
  const [formProject, setFormProject]   = useState(null);        // form modal
  const [showForm, setShowForm] = useState(false);

  /* ── FETCH ── */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = activeTab === "mine"
        ? await getMyProjects()
        : await getAllProjects({
            ...(search.trim() && { search: search.trim() }),
            ...(filterStatus !== "all" && { status: filterStatus }),
            ...(filterTag !== "all" && { tags: filterTag }),
          });
      setProjects(res.data?.projects || res.data || []);
    } catch (err) {
      setFetchError("Failed to load projects. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, filterStatus, filterTag]);

  /* Debounced search */
  useEffect(() => {
    const t = setTimeout(fetchProjects, 350);
    return () => clearTimeout(t);
  }, [fetchProjects]);

  /* ── CREATE ── */
  const handleCreate = async (form) => {
    const res = await createProject(form);
    const created = res.data?.project || res.data;
    setProjects((p) => [created, ...p]);
  };

  /* ── EDIT ── */
  const handleUpdate = async (form) => {
    const res = await updateProject(form._id, form);
    const updated = res.data?.project || res.data;
    setProjects((p) => p.map((x) => (x._id === updated._id ? updated : x)));
    if (selectedProject?._id === updated._id) setSelectedProject(updated);
  };

  /* ── DELETE ── */
  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProject(projectId);
      setProjects((p) => p.filter((x) => x._id !== projectId));
      if (selectedProject?._id === projectId) setSelectedProject(null);
    } catch {
      alert("Failed to delete project.");
    }
  };

  /* ── OPEN CHAT ── */
  const handleOpenChat = async (projectId) => {
    const res = await getProjectRoom(projectId);
    const commId = res.data?.community?._id;
    if (commId) {
      navigate(`/community/${commId}`);
      setSelectedProject(null); // Close modal when navigating
    } else {
      throw new Error("Chat room not found.");
    }
  };

  /* ── COLLAB TOGGLE ── */
  const handleCollabToggle = async (projectId, requestId, status) => {
    if (status === "accepted" || status === "pending") return;
    try {
      const res = await sendCollabRequest(projectId);
      const updatedProject = res.data?.project || res.data;
      if (updatedProject) {
        setProjects((p) => p.map((x) => (x._id === projectId ? updatedProject : x)));
        if (selectedProject?._id === projectId) setSelectedProject(updatedProject);
      } else {
        // optimistic update
        setProjects((p) =>
          p.map((x) =>
            x._id === projectId
              ? {
                  ...x,
                  collaborationRequests: [
                    ...(x.collaborationRequests || []),
                    { _id: Date.now().toString(), user: { _id: user._id, name: user.name }, status: "pending" },
                  ],
                }
              : x
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request.");
    }
  };

  /* ── REMOVE COLLABORATOR (owner) ── */
  const handleRemoveCollaborator = async (projectId, reqId) => {
    if (!window.confirm("Remove this collaborator from the project?")) return;
    try {
      const res = await removeCollaborator(projectId, reqId);
      const updatedProject = res.data?.project || res.data;
      if (updatedProject) {
        setProjects((p) => p.map((x) => (x._id === projectId ? updatedProject : x)));
        setSelectedProject(updatedProject);
      } else {
        // optimistic update
        const strip = (p) => ({
          ...p,
          collaborationRequests: p.collaborationRequests.filter((r) => r._id !== reqId),
        });
        setProjects((p) => p.map((x) => (x._id === projectId ? strip(x) : x)));
        setSelectedProject((prev) => (prev?._id === projectId ? strip(prev) : prev));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove collaborator.");
    }
  };

  /* ── REQUEST ACCEPT / REJECT (owner) ── */
  const handleRequestAction = async (projectId, reqId, action) => {
    try {
      const endpoint =
        action === "accept"
          ? `/projects/${projectId}/collaborate/${reqId}/accept`
          : `/projects/${projectId}/collaborate/${reqId}/reject`;

      const { default: api } = await import("../api/api");
      const res = await api.put(endpoint);
      const updatedProject = res.data?.project || res.data;

      if (updatedProject) {
        setProjects((p) => p.map((x) => (x._id === projectId ? updatedProject : x)));
        setSelectedProject(updatedProject);
      } else {
        // optimistic
        setProjects((p) =>
          p.map((x) =>
            x._id === projectId
              ? {
                  ...x,
                  collaborationRequests: x.collaborationRequests.map((r) =>
                    r._id === reqId ? { ...r, status: action === "accept" ? "accepted" : "rejected" } : r
                  ),
                }
              : x
          )
        );
        setSelectedProject((prev) =>
          prev?._id === projectId
            ? {
                ...prev,
                collaborationRequests: prev.collaborationRequests.map((r) =>
                  r._id === reqId ? { ...r, status: action === "accept" ? "accepted" : "rejected" } : r
                ),
              }
            : prev
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} request.`);
    }
  };

  /* ── FILTERED VIEW (client-side for "mine" tab) ── */
  const displayed = projects.filter((p) => {
    const matchSearch =
      !search.trim() ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchTag = filterTag === "all" || p.tags?.includes(filterTag);
    return matchSearch && matchStatus && matchTag;
  });

  /* ── RENDER ── */
  return (
    <>
      <Navbar />

      {/* ── PAGE HEADER ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)",
          paddingTop: "4rem",
          paddingBottom: "5rem",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20"
               style={{ background: "radial-gradient(circle, #818cf8, transparent)" }} />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20"
               style={{ background: "radial-gradient(circle, #c084fc, transparent)" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Project Hub
          </h1>
          <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-8">
            Discover student projects, find collaborators, and build something amazing together.
          </p>

          {isAuthenticated && (
            <button
              onClick={() => { setFormProject(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-white text-indigo-700
                         font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5
                         transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a Project
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 -mt-8">

        {/* ── FILTER CARD ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">

            {/* Tabs */}
            {isAuthenticated && (
              <div className="flex rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                {["all", "mine"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-semibold transition
                                ${activeTab === tab
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                  >
                    {tab === "all" ? "All Projects" : "My Projects"}
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg"
                   className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by title or description…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
              />
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-600 font-medium"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Tag filter */}
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-600 font-medium"
            >
              <option value="all">All Tags</option>
              {ALL_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        {!loading && displayed.length > 0 && (
          <p className="text-sm text-slate-400 mb-5">
            Showing <span className="font-semibold text-slate-600">{displayed.length}</span> project{displayed.length !== 1 ? "s" : ""}
            {filterStatus !== "all" ? ` · ${filterStatus}` : ""}
            {filterTag !== "all" ? ` · ${filterTag}` : ""}
          </p>
        )}

        {/* ── GRID ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <Spinner size={10} />
            <p className="text-sm">Loading projects…</p>
          </div>
        ) : fetchError ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-sm mb-4">{fetchError}</p>
            <button
              onClick={fetchProjects}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Retry
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🧑‍💻</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {activeTab === "mine" ? "You haven't posted any projects yet." : "No projects found."}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {activeTab === "mine"
                ? "Share your ideas and find collaborators!"
                : "Try adjusting your filters or be the first to post!"}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => { setFormProject(null); setShowForm(true); }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600
                           text-white font-semibold text-sm shadow-md hover:opacity-90 transition"
              >
                Post the first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                currentUserId={user?._id}
                onOpen={setSelectedProject}
                onCollabToggle={handleCollabToggle}
                onEdit={(p) => { setFormProject(p); setShowForm(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* ── DETAIL MODAL ── */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          currentUserId={user?._id}
          onClose={() => setSelectedProject(null)}
          onCollabToggle={handleCollabToggle}
          onEdit={(p) => { setFormProject(p); setShowForm(true); }}
          onDelete={handleDelete}
          onRequestAction={handleRequestAction}
          onRemoveCollaborator={handleRemoveCollaborator}
          onOpenChat={handleOpenChat}
        />
      )}

      {/* ── FORM MODAL ── */}
      {showForm && (
        <ProjectFormModal
          initial={formProject}
          onClose={() => { setShowForm(false); setFormProject(null); }}
          onSave={formProject ? handleUpdate : handleCreate}
        />
      )}
    </>
  );
};

export default Projects;
