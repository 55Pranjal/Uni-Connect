import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import CreateChannelModal from "../components/modals/CreateChannelModal";
import CommunityMembersModal from "../components/modals/CommunityMembersModal";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import DeleteChannelModal from "../components/modals/DeleteChannelModal";
import RenameChannelModal from "../components/modals/RenameChannelModal";
import LeaveCommunityModal from "../components/modals/LeaveCommunityModal";
import BannedMembersModal from "../components/modals/BannedMembersModal";
import {
  createHelpRequest,
  claimHelpRequest,
  resolveHelpRequest,
} from "../api/helpRequests";
import CreateHelpRequestModal from "../components/modals/CreateHelpRequestModal";
import HelpRequestCard from "../components/cards/HelpRequestCard";
import { notifyXp, refreshXp } from "../components/XpToastHost";
import { useCommunity } from "../hooks/useChannels";
import { useHelpRequests } from "../hooks/useHelpRequests";

const ChannelPage = () => {
  const { communityId, channelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  // Community bundle + per-channel help requests come from query hooks.
  const { data: communityData, setData: setCommunityData } =
    useCommunity(communityId);
  const community = communityData?.community ?? null;
  const channels = communityData?.channels ?? [];
  const myRole = communityData?.myRole ?? null;

  const {
    data: helpRequestsData,
    loading: loadingHelp,
    setData: setHelpRequests,
  } = useHelpRequests(channelId);
  const helpRequests = helpRequestsData ?? [];

  // Helpers for patching slices of the community bundle without losing the rest.
  const patchChannels = useCallback(
    (updater) =>
      setCommunityData((prev) =>
        prev ? { ...prev, channels: updater(prev.channels) } : prev
      ),
    [setCommunityData]
  );

  const [showModal, setShowModal] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);

  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [showBanned, setShowBanned] = useState(false);

  // Help Request UI State
  const [activeTab, setActiveTab] = useState("chat");
  const [showHelpModal, setShowHelpModal] = useState(false);

  const canManageChannels = myRole === "admin";

  /* ================= DEFAULT-CHANNEL REDIRECT =================
     Once the community bundle has loaded and the URL has no channelId,
     bounce to the default (or first) channel. */
  useEffect(() => {
    if (!communityData || channelId) return;
    if (channels.length === 0) return;
    const defaultChannel = channels.find((c) => c.isDefault) || channels[0];
    navigate(`/community/${communityId}/channel/${defaultChannel._id}`, {
      replace: true,
    });
  }, [communityData, channelId, channels, communityId, navigate]);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    if (!socket) return;

    const joinCommunity = () => socket.emit("joinCommunity", communityId);
    // Join now (if already connected) and on every reconnect.
    if (socket.connected) joinCommunity();
    socket.on("connect", joinCommunity);

    const handleChannelDeleted = ({ channelId: deletedId }) => {
      patchChannels((prev) => prev.filter((c) => c._id !== deletedId));

      if (channelId === deletedId) {
        navigate(`/community/${communityId}`);
      }
    };

    const handleChannelRenamed = ({ channelId: renamedId, name }) => {
      patchChannels((prev) =>
        prev.map((c) => (c._id === renamedId ? { ...c, name } : c))
      );
    };

    // Live help-request updates: when anyone in this community creates,
    // claims, or resolves a request, refresh the local list so other viewers
    // (especially the asker, when the helper claims) see it without reload.
    const handleHelpCreated = (hr) => {
      if (hr.channelId !== channelId) return; // only the active channel's list
      setHelpRequests((prev) => {
        const list = prev ?? [];
        return list.some((x) => x._id === hr._id) ? list : [hr, ...list];
      });
    };

    const handleHelpUpdated = (hr) => {
      setHelpRequests((prev) =>
        (prev ?? []).map((x) => (x._id === hr._id ? hr : x))
      );
    };

    socket.on("channelDeleted", handleChannelDeleted);
    socket.on("channelRenamed", handleChannelRenamed);
    socket.on("helpRequest:created", handleHelpCreated);
    socket.on("helpRequest:updated", handleHelpUpdated);

    return () => {
      socket.off("connect", joinCommunity);
      socket.off("channelDeleted", handleChannelDeleted);
      socket.off("channelRenamed", handleChannelRenamed);
      socket.off("helpRequest:created", handleHelpCreated);
      socket.off("helpRequest:updated", handleHelpUpdated);
    };
  }, [
    socket,
    communityId,
    channelId,
    patchChannels,
    setHelpRequests,
    navigate,
  ]);

  /* ================= CREATE CHANNEL ================= */
  const handleCreateChannel = async (data) => {
    try {
      // Backend returns the full community bundle; replace cache wholesale.
      const res = await api.post(`/community/${communityId}/channel`, data);
      setCommunityData(res.data);

      setShowModal(false);

      const newChannel = res.data.channels[res.data.channels.length - 1];
      navigate(`/community/${communityId}/channel/${newChannel._id}`);
    } catch {
      /* api interceptor surfaces the toast */
    }
  };

  /* ================= DELETE CHANNEL ================= */
  const handleDeleteSuccess = (deletedId) => {
    patchChannels((prev) => prev.filter((c) => c._id !== deletedId));

    if (channelId === deletedId) {
      navigate(`/community/${communityId}`);
    }
  };

  /* ================= RENAME CHANNEL ================= */
  const handleRenameSuccess = (id, newName) => {
    patchChannels((prev) =>
      prev.map((c) => (c._id === id ? { ...c, name: newName } : c))
    );
  };

  /* ================= HELP REQUEST MUTATIONS =================
     The hook fires the initial fetch automatically; mutations just patch the
     cache with the fresh entity from each response. Socket broadcasts cover
     updates from other users. */
  const handleCreateHelpRequest = async (data) => {
    try {
      const res = await createHelpRequest({
        ...data,
        communityId,
        channelId,
      });
      setHelpRequests((prev) => [res.data.helpRequest, ...(prev ?? [])]);
      setShowHelpModal(false);
    } catch {
      /* api interceptor surfaces the toast */
    }
  };

  const handleClaim = async (id) => {
    try {
      const res = await claimHelpRequest(id);
      setHelpRequests((prev) =>
        (prev ?? []).map((hr) => (hr._id === id ? res.data.helpRequest : hr))
      );
    } catch {
      /* api interceptor surfaces the toast */
    }
  };

  const handleResolve = async (id, data) => {
    try {
      const res = await resolveHelpRequest(id, data);
      setHelpRequests((prev) =>
        (prev ?? []).map((hr) => (hr._id === id ? res.data.helpRequest : hr))
      );
      const newLevel = res.data.levelUpResults?.resolverNewLevel;
      if (newLevel) {
        notifyXp(`Helper levelled up to Lv. ${newLevel}!`, { kind: "levelup" });
      } else {
        notifyXp("Help request resolved — XP awarded.");
      }
      refreshXp();
    } catch {
      /* api interceptor surfaces the toast */
    }
  };

  return (
    <>
      <Navbar />

      <div className="h-[90vh] flex bg-slate-100 relative overflow-hidden">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside
          className={`${showSidebar ? "flex absolute z-40 h-full shadow-2xl" : "hidden"} md:flex md:static w-64 bg-white border-r flex-col`}
        >
          {/* Community Header */}
          <div className="p-4 border-b relative">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg truncate pr-2">
                {community?.name}
              </h2>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCommunityMenuOpen((prev) => !prev)}
                  aria-label="Community options"
                  aria-haspopup="menu"
                  aria-expanded={communityMenuOpen}
                  className="text-slate-400 hover:text-slate-600 px-1"
                >
                  ⋮
                </button>
                <button
                  onClick={() => setShowSidebar(false)}
                  aria-label="Close sidebar"
                  className="md:hidden text-slate-400 hover:text-slate-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <p
              onClick={() => setShowMembers(true)}
              className="text-xs text-slate-500 cursor-pointer hover:text-neutral-900 transition"
            >
              👥 {community?.memberCount || 0} members
            </p>

            {communityMenuOpen && (
              <div className="absolute right-4 top-12 bg-white shadow-lg border rounded-lg w-40 z-50">
                <button
                  onClick={() => {
                    setShowMembers(true);
                    setCommunityMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100"
                >
                  View Members
                </button>

                <button
                  onClick={() => {
                    setShowBanned(true);
                    setCommunityMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100"
                >
                  Banned Users
                </button>

                {myRole === "admin" && (
                  <button
                    onClick={() => {
                      setCommunityMenuOpen(false);
                      navigate(`/community/${communityId}/moderation`);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100"
                  >
                    Moderation
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowLeaveModal(true);
                    setCommunityMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-slate-100"
                >
                  Leave Community
                </button>
              </div>
            )}
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-xs uppercase text-slate-400 px-2">
              Channels
            </div>

            {channels.map((ch) => (
              <div
                key={ch._id}
                onClick={() => {
                  navigate(`/community/${communityId}/channel/${ch._id}`);
                  setShowSidebar(false);
                }}
                className={`relative group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 ${
                  ch._id === channelId
                    ? "text-neutral-900 font-medium bg-orange-50"
                    : ""
                }`}
              >
                <span className="flex-1 text-left truncate"># {ch.name}</span>

                {canManageChannels && !ch.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === ch._id ? null : ch._id);
                    }}
                    aria-label={`Channel options for ${ch.name}`}
                    aria-haspopup="menu"
                    aria-expanded={openMenu === ch._id}
                    className="text-slate-400 hover:text-slate-600 px-1"
                  >
                    ⋮
                  </button>
                )}

                {openMenu === ch._id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-10 bg-white shadow-lg rounded-lg border w-40 z-50"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameTarget(ch);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100"
                    >
                      Rename
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(ch);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-slate-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Channel */}
          {canManageChannels && (
            <div className="p-3 border-t">
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition"
              >
                + Add Channel
              </button>
            </div>
          )}
        </aside>

        {/* ===== MAIN CHAT AREA ===== */}
        <main className="flex-1 flex flex-col h-[90vh]">
          {/* Header Area */}
          <div className="flex items-center gap-3 border-b bg-white px-4 md:px-6 py-3 shrink-0 overflow-x-auto min-h-[60px]">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            {/* Tab Selection */}
            {channelId && (
              <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-1 text-sm font-medium rounded-md transition whitespace-nowrap ${
                    activeTab === "chat"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setActiveTab("help")}
                  className={`px-4 py-1 text-sm font-medium rounded-md transition whitespace-nowrap ${
                    activeTab === "help"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  ✋ Help Requests
                </button>
              </div>
            )}
          </div>

          {activeTab === "chat" || !channelId ? (
            <Outlet context={{ myRole }} />
          ) : (
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Help Requests
                  </h3>
                  <p className="text-sm text-slate-500">
                    Ask for help or assist others in this channel.
                  </p>
                </div>
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="px-5 py-2 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition shadow-sm"
                >
                  + Post Request
                </button>
              </div>

              {loadingHelp ? (
                <div className="text-slate-500">Loading requests...</div>
              ) : helpRequests.length === 0 ? (
                <div className="text-slate-500 text-center py-10 bg-white border border-dashed rounded-xl border-slate-300">
                  No help requests yet. Be the first to ask!
                </div>
              ) : (
                <div className="space-y-4">
                  {helpRequests.map((hr) => (
                    <HelpRequestCard
                      key={hr._id}
                      request={hr}
                      currentUserId={user?._id}
                      onClaim={handleClaim}
                      onResolve={handleResolve}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CREATE CHANNEL MODAL */}
      <CreateChannelModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateChannel}
      />

      {/* MEMBERS MODAL */}
      <CommunityMembersModal
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        communityId={communityId}
        currentUserId={user?._id}
        myRole={myRole}
      />

      {/* DELETE CHANNEL MODAL */}
      <DeleteChannelModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        communityId={communityId}
        channel={deleteTarget}
        onSuccess={handleDeleteSuccess}
      />

      {/* RENAME CHANNEL MODAL */}
      <RenameChannelModal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        communityId={communityId}
        channel={renameTarget}
        onSuccess={handleRenameSuccess}
      />

      {/* LEAVE COMMUNITY MODAL */}
      <LeaveCommunityModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        communityId={communityId}
      />

      {/* BANNED MEMBERS MODAL */}
      <BannedMembersModal
        isOpen={showBanned}
        onClose={() => setShowBanned(false)}
        communityId={communityId}
        myRole={myRole}
      />

      {/* CREATE HELP REQUEST MODAL */}
      <CreateHelpRequestModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        onCreate={handleCreateHelpRequest}
      />
    </>
  );
};

export default ChannelPage;
