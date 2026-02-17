import { useEffect, useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import CreateChannelModal from "../components/modals/CreateChannelModal";

const ChannelPage = () => {
  const { communityId, channelId } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [myRole, setMyRole] = useState(null);

  /* ================= FETCH COMMUNITY + CHANNELS ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/community/${communityId}`);

        setCommunity(res.data.community);
        setChannels(res.data.channels);
        setMyRole(res.data.myRole); // 🔥 important

        // Auto redirect to default channel
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-center text-slate-500">
          Loading community...
        </div>
      </>
    );
  }

  /* ================= CREATE CHANNEL ================= */
  const handleCreateChannel = async (data) => {
    try {
      const res = await api.post(`/community/${communityId}/channel`, data);

      // Backend returns updated structure
      setCommunity(res.data.community);
      setChannels(res.data.channels);
      setMyRole(res.data.myRole);

      setShowModal(false);

      // Navigate to newly created channel
      const newChannel = res.data.channels[res.data.channels.length - 1];

      navigate(`/community/${communityId}/channel/${newChannel._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create channel");
    }
  };

  const canCreateChannel = myRole === "admin" || myRole === "owner";

  return (
    <>
      <Navbar />

      <div className="h-[90vh] flex bg-slate-100">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="w-64 bg-white border-r flex flex-col">
          {/* Community Header */}
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">{community?.name}</h2>
            <p className="text-xs text-slate-500">
              {community?.memberCount || 0} members
            </p>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-xs uppercase text-slate-400 px-2">
              Channels
            </div>

            {channels.map((ch) => (
              <button
                key={ch._id}
                onClick={() =>
                  navigate(`/community/${communityId}/channel/${ch._id}`)
                }
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  ch._id === channelId
                    ? "bg-indigo-100 text-indigo-600 font-medium"
                    : "hover:bg-slate-100"
                }`}
              >
                # {ch.name}
              </button>
            ))}
          </div>

          {/* Add Channel Button */}
          {canCreateChannel && (
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
          {/* 🔥 Role passed safely to chat page */}
          <Outlet context={{ myRole }} />
        </main>
      </div>

      <CreateChannelModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateChannel}
      />
    </>
  );
};

export default ChannelPage;
