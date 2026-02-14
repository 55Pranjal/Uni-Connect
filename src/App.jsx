import { Routes, Route } from "react-router-dom";

import "./App.css";

import Login from "./components/login.jsx";
import Signup from "./components/signup.jsx";
import ProfileDecision from "./components/ProfileDecision.jsx";
import Onboarding from "./components/Onboarding.jsx";
import Home from "./components/Home.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import DiscoverPage from "./components/DiscoverPage.jsx";
import PublicProfilePage from "./components/PublicProfilePage.jsx";
import ConnectionsPage from "./components/ConnectionsPage.jsx";
import ChatPage from "./components/ChatPage.jsx";
import CommunityPage from "./components/CommunityPage.jsx";
import CreateCommunity from "./components/CreateCommunity.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profileDecision" element={<ProfileDecision />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/public/:id" element={<PublicProfilePage />} />
      <Route path="/connections" element={<ConnectionsPage />} />

      {/* 🔥 NEW CHANNEL-BASED CHAT ROUTE */}
      <Route
        path="/community/:communityId/channel/:channelId"
        element={<ChatPage />}
      />

      <Route path="/communities" element={<CommunityPage />} />
      <Route path="/create-community" element={<CreateCommunity />} />

      <Route path="*" element={<div>NO ROUTE MATCHED</div>} />
    </Routes>
  );
}

export default App;
