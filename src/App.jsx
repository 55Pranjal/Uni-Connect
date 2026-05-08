import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import ProfileDecision from "./components/ProfileDecision.jsx";
import Onboarding from "./components/Onboarding.jsx";
import Home from "./components/Home.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import DiscoverPage from "./components/DiscoverPage.jsx";
import PublicProfilePage from "./components/PublicProfilePage.jsx";
import ConnectionsPage from "./components/ConnectionsPage.jsx";
import DMChatPage from "./components/DMChatPage.jsx";
import CommunityPage from "./components/CommunityPage.jsx";
import CreateCommunity from "./components/CreateCommunity.jsx";
import ChannelPage from "./components/ChannelPage.jsx";
import CommunityChatPage from "./components/CommunityChatPage.jsx";
import BackendLoader from "./components/BackendLoader.jsx";
import Projects from "./components/Projects.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BackendLoader>
      <div
        className="min-h-screen flex flex-col w-full [&>*]:w-full"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: "url('/doodles.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "320px",
          backgroundAttachment: "fixed",
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/public/:id" element={<PublicProfilePage />} />
          <Route path="/projects" element={<Projects />}/>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profileDecision" element={<ProfileDecision />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/dm/:conversationId" element={<DMChatPage />} />
            <Route path="/communities" element={<CommunityPage />} />
            <Route path="/create-community" element={<CreateCommunity />} />
            <Route path="/community/:communityId" element={<ChannelPage />}>
              <Route path="channel/:channelId" element={<CommunityChatPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div>NO ROUTE MATCHED</div>} />
        </Routes>
      </div>
    </BackendLoader>
  );
}

export default App;
