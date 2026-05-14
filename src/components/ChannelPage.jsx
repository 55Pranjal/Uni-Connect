import { useEffect, useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import CreateChannelModal from "../components/modals/CreateChannelModal";
import CommunityMembersModal from "../components/modals/CommunityMembersModal";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import DeleteChannelModal from "../components/modals/DeleteChannelModal";
import RenameChannelModal from "../components/modals/RenameChannelModal";
import LeaveCommunityModal from "../components/modals/LeaveCommunityModal";
import BannedMembersModal from "./modals/BannedMembersModal";
import { getHelpRequestsByChannel, createHelpRequest, claimHelpRequest, resolveHelpRequest } from "../api/helpRequests";
import CreateHelpRequestModal from "./modals/CreateHelpRequestModal";
import HelpRequestCard from "./cards/HelpRequestCard";
import { notifyXp, refreshXp } from "./XpToastHost";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const ChannelPage = () => {
  const { communityId, channelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [myRole, setMyRole] = useState(null);
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
  const [helpRequests, setHelpRequests] = useState([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loadingHelp, setLoadingHelp] = useState(false);

  const canManageChannels = myRole === "admin";

  /* ================= FETCH COMMUNITY + CHANNELS ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/community/${communityId}`);

        setCommunity(res.data.community);
        setChannels(res.data.channels);
        setMyRole(res.data.myRole);

        if (!channelId && res.data.channels.length > 0) {
          const defaultChannel =
            res.data.channels.find((c) => c.isDefault) || res.data.channels[0];

          navigate(`/community/${communityId}/channel/${defaultChannel._id}`, {
            replace: true,
          });
        }
      } catch (err) {
        console.error("Failed to load community:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId]);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    socket.emit("joinCommunity", communityId);

    const handleChannelDeleted = ({ channelId: deletedId }) => {
      setChannels((prev) => prev.filter((c) => c._id !== deletedId));

      if (channelId === deletedId) {
        navigate(`/community/${communityId}`);
      }
    };

    const handleChannelRenamed = ({ channelId, name }) => {
      setChannels((prev) =>
        prev.map((c) => (c._id === channelId ? { ...c, name } : c)),
      );
    };

    socket.on("channelDeleted", handleChannelDeleted);
    socket.on("channelRenamed", handleChannelRenamed);

    return () => {
      socket.off("channelDeleted", handleChannelDeleted);
      socket.off("channelRenamed", handleChannelRenamed);
    };
  }, [communityId]); // 🔥 remove channelId

  /* ================= CREATE CHANNEL ================= */
  const handleCreateChannel = async (data) => {
    try {
      const res = await api.post(`/community/${communityId}/channel`, data);

      setCommunity(res.data.community);
      setChannels(res.data.channels);
      setMyRole(res.data.myRole);

      setShowModal(false);

      const newChannel = res.data.channels[res.data.channels.length - 1];

      navigate(`/community/${communityId}/channel/${newChannel._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create channel");
    }
  };

  /* ================= DELETE CHANNEL ================= */
  const handleDeleteSuccess = (deletedId) => {
    setChannels((prev) => prev.filter((c) => c._id !== deletedId));

    if (channelId === deletedId) {
      navigate(`/community/${communityId}`);
    }
  };

  /* ================= RENAME CHANNEL ================= */
  const handleRenameSuccess = (id, newName) => {
    setChannels((prev) =>
      prev.map((c) => (c._id === id ? { ...c, name: newName } : c)),
    );
  };

  /* ================= HELP REQUESTS ================= */
  useEffect(() => {
    if (channelId && activeTab === "help") {
      fetchHelpRequests();
    }
  }, [channelId, activeTab]);

  const fetchHelpRequests = async () => {
    setLoadingHelp(true);
    try {
      const res = await getHelpRequestsByChannel(channelId);
      setHelpRequests(res.data.helpRequests);
    } catch (err) {
      console.error("Failed to fetch help requests", err);
    } finally {
      setLoadingHelp(false);
    }
  };

  const handleCreateHelpRequest = async (data) => {
    try {
      const res = await createHelpRequest({
        ...data,
        communityId,
        channelId,
      });
      setHelpRequests([res.data.helpRequest, ...helpRequests]);
      setShowHelpModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create help request");
    }
  };

  const handleClaim = async (id) => {
    try {
      const res = await claimHelpRequest(id);
      setHelpRequests((prev) =>
        prev.map((hr) => (hr._id === id ? res.data.helpRequest : hr))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to claim help request");
    }
  };

  const handleResolve = async (id, data) => {
    try {
      const res = await resolveHelpRequest(id, data);
      setHelpRequests((prev) =>
        prev.map((hr) => (hr._id === id ? res.data.helpRequest : hr))
      );
      const newLevel = res.data.levelUpResults?.resolverNewLevel;
      if (newLevel) {
        notifyXp(`Helper levelled up to Lv. ${newLevel}!`, { kind: "levelup" });
      } else {
        notifyXp("Help request resolved — XP awarded.");
      }
      refreshXp();
    } catch (err) {
      notifyXp(err.response?.data?.message || "Failed to resolve help request");
    }
  };

  return (
    <>
      <Navbar />

      <div className="h-[90vh] flex bg-slate-100 relative overflow-hidden">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside className={`${showSidebar ? 'flex absolute z-40 h-full shadow-2xl' : 'hidden'} md:flex md:static w-64 bg-white border-r flex-col`}>
          {/* Community Header */}
          <div className="p-4 border-b relative">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg truncate pr-2">{community?.name}</h2>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCommunityMenuOpen((prev) => !prev)}
                  className="text-slate-400 hover:text-slate-600 px-1"
                >
                  ⋮
                </button>
                <button onClick={() => setShowSidebar(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                className="relative group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                <button
                  onClick={() => {
                    navigate(`/community/${communityId}/channel/${ch._id}`);
                    setShowSidebar(false);
                  }}
                  className={`flex-1 text-left ${
                    ch._id === channelId ? "text-neutral-900 font-medium bg-orange-50" : ""
                  }`}
                >
                  # {ch.name}
                </button>

                {canManageChannels && !ch.isDefault && (
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === ch._id ? null : ch._id)
                    }
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ⋮
                  </button>
                )}

                {openMenu === ch._id && (
                  <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg border w-40 z-50">
                    <button
                      onClick={() => {
                        setRenameTarget(ch);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100"
                    >
                      Rename
                    </button>

                    <button
                      onClick={() => {
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
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
                  <h3 className="text-xl font-bold text-slate-800">Help Requests</h3>
                  <p className="text-sm text-slate-500">Ask for help or assist others in this channel.</p>
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
