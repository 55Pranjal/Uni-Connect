import { useEffect, useState } from "react";
import api from "../api/api";

const BackendLoader = ({ children }) => {
  const [backendReady, setBackendReady] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const wakeBackend = async () => {
      try {
        await api.get("/health");
        setBackendReady(true);
      } catch {
        setTimeout(wakeBackend, 2000);
      }
    };

    wakeBackend();

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!backendReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: "url('/doodles.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "320px",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Center Card */}
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-10 max-w-md w-full text-center border border-gray-200">
          {/* App name */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">UniConnect</h1>

          <p className="text-gray-500 mb-6">Starting backend server</p>

          {/* Loader Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Status */}
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Waking up server{dots}
          </h2>

          <p className="text-sm text-gray-500 leading-relaxed">
            The backend is hosted on Render's free tier and may take
            <span className="font-medium text-gray-700"> 10–20 seconds </span>
            to start on the first request.
          </p>

          {/* Fake progress bar */}
          <div className="mt-8 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default BackendLoader;
