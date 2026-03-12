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

  const [openMenu, setOpenMenu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);

  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [showBanned, setShowBanned] = useState(false);

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

  return (
    <>
      <Navbar />

      <div className="h-[90vh] flex bg-slate-100">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="w-64 bg-white border-r flex flex-col">
          {/* Community Header */}
          <div className="p-4 border-b relative">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{community?.name}</h2>

              <button
                onClick={() => setCommunityMenuOpen((prev) => !prev)}
                className="text-slate-400 hover:text-slate-600"
              >
                ⋮
              </button>
            </div>

            <p
              onClick={() => setShowMembers(true)}
              className="text-xs text-slate-500 cursor-pointer hover:text-indigo-600 transition"
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
                  onClick={() =>
                    navigate(`/community/${communityId}/channel/${ch._id}`)
                  }
                  className={`flex-1 text-left ${
                    ch._id === channelId ? "text-indigo-600 font-medium" : ""
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
                className="w-full py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                + Add Channel
              </button>
            </div>
          )}
        </aside>

        {/* ===== MAIN CHAT AREA ===== */}
        <main className="flex-1 flex flex-col">
          <Outlet context={{ myRole }} />
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
    </>
  );
};

export default ChannelPage;
