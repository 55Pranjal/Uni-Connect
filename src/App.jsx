import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Kept as static imports:
//   - Login/Signup: tiny auth pages users hit immediately on a cold visit.
//   - Home: landing route, always-on-mount for the unauthenticated path.
//   - NotFound: small, and we want it ready instantly for bad URLs.
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

// Lazy-loaded routes — each gets its own chunk and pays for itself only when
// the user navigates there.
const ProfileDecision = lazy(() => import("./pages/ProfileDecision.jsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage.jsx"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage.jsx"));
const ConnectionsPage = lazy(() => import("./pages/ConnectionsPage.jsx"));
const DMChatPage = lazy(() => import("./pages/DMChatPage.jsx"));
const CommunityPage = lazy(() => import("./pages/CommunityPage.jsx"));
const CreateCommunity = lazy(() => import("./pages/CreateCommunity.jsx"));
const ChannelPage = lazy(() => import("./pages/ChannelPage.jsx"));
const CommunityChatPage = lazy(() => import("./pages/CommunityChatPage.jsx"));
const ModerationPage = lazy(() => import("./pages/ModerationPage.jsx"));
const Projects = lazy(() => import("./pages/Projects.jsx"));

import BackendLoader from "./components/BackendLoader.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import XpToastHost from "./components/XpToastHost.jsx";
import XpSocket from "./components/XpSocket.jsx";
import RouteFallback from "./components/RouteFallback.jsx";
import IOSInstallBanner from "./components/IOSInstallBanner.jsx";
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
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/public/:id" element={<PublicProfilePage />} />
                  <Route path="/projects" element={<Projects />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route
                      path="/profileDecision"
                      element={<ProfileDecision />}
                    />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/connections" element={<ConnectionsPage />} />
                    <Route
                      path="/dm/:conversationId"
                      element={<DMChatPage />}
                    />
                    <Route path="/communities" element={<CommunityPage />} />
                    <Route
                      path="/create-community"
                      element={<CreateCommunity />}
                    />
                    <Route
                      path="/community/:communityId/moderation"
                      element={<ModerationPage />}
                    />
                    <Route
                      path="/community/:communityId"
                      element={<ChannelPage />}
                    >
                      <Route
                        path="channel/:channelId"
                        element={<CommunityChatPage />}
                      />
                    </Route>
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <XpToastHost />
              <XpSocket />
              <IOSInstallBanner />
            </div>
          </RouteErrorBoundary>
        </SocketProvider>
      </ToastProvider>
    </BackendLoader>
  );
}

export default App;
