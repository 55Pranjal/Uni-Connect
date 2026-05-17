import { Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProfileDecision from "./pages/ProfileDecision.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Home from "./pages/Home.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import DiscoverPage from "./pages/DiscoverPage.jsx";
import PublicProfilePage from "./pages/PublicProfilePage.jsx";
import ConnectionsPage from "./pages/ConnectionsPage.jsx";
import DMChatPage from "./pages/DMChatPage.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import CreateCommunity from "./pages/CreateCommunity.jsx";
import ChannelPage from "./pages/ChannelPage.jsx";
import CommunityChatPage from "./pages/CommunityChatPage.jsx";
import Projects from "./pages/Projects.jsx";
import NotFound from "./pages/NotFound.jsx";
import BackendLoader from "./components/BackendLoader.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import XpToastHost from "./components/XpToastHost.jsx";
import XpSocket from "./components/XpSocket.jsx";
import { RouteErrorBoundary } from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";

function App() {
  return (
    <BackendLoader>
      <ToastProvider>
        <SocketProvider>
          <RouteErrorBoundary>
            <div
              className="min-h-screen flex flex-col w-full [&>*]:w-full pl-page"
              style={{ background: "var(--pl-bg)" }}
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/public/:id" element={<PublicProfilePage />} />
                <Route path="/projects" element={<Projects />} />

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
                <Route path="*" element={<NotFound />} />
              </Routes>
              <XpToastHost />
              <XpSocket />
            </div>
          </RouteErrorBoundary>
        </SocketProvider>
      </ToastProvider>
    </BackendLoader>
  );
}

export default App;
