import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import channelMessageRoutes from "./routes/messageRoutes.js";
import dmRoutes from "./routes/dmRoutes.js";
import communityRoutes from "./routes/communityRoute.js";

import Message from "./models/Message.js";

import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

/* =======================
   ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/channels", channelMessageRoutes);
app.use("/api/dm", dmRoutes);
app.use("/api/community", communityRoutes);

/* =======================
   SOCKET.IO SETUP
======================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  /* =======================
     COMMUNITY JOIN
  ======================= */
  socket.on("joinCommunity", (communityId) => {
    socket.join(`community:${communityId}`);
  });

  /* =======================
     CHANNEL JOIN
  ======================= */
  socket.on("joinChannel", (channelId) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on("leaveChannel", (channelId) => {
    socket.leave(`channel:${channelId}`);
  });

  /* =======================
     SEND COMMUNITY MESSAGE
  ======================= */
  socket.on("sendMessage", async ({ messageId, channelId }) => {
    try {
      const message = await Message.findById(messageId).populate(
        "senderId",
        "name avatar",
      );

      if (!message) return;

      io.to(`channel:${channelId}`).emit("receiveMessage", message);
    } catch (err) {
      console.error("❌ sendMessage error:", err.message);
    }
  });

  /* =======================
     COMMUNITY TYPING
  ======================= */
  socket.on("typing:start", ({ channelId, userId, name }) => {
    socket.to(`channel:${channelId}`).emit("typing:start", {
      userId,
      name,
    });
  });

  socket.on("typing:stop", ({ channelId, userId }) => {
    socket.to(`channel:${channelId}`).emit("typing:stop", {
      userId,
    });
  });

  /* =====================================================
     =================== DM SECTION ======================
     ===================================================== */

  /* JOIN CONVERSATION */
  socket.on("joinConversation", (conversationId) => {
    console.log("📩 Joining conversation:", conversationId);
    socket.join(`conversation:${conversationId}`);
  });

  /* SEND DM */
  socket.on("sendDM", async ({ messageId, conversationId }) => {
    try {
      const message = await Message.findById(messageId).populate(
        "senderId",
        "name avatar",
      );

      if (!message) return;

      console.log("📨 Broadcasting DM:", message._id);

      io.to(`conversation:${conversationId}`).emit("receiveDM", message);
    } catch (err) {
      console.error("❌ sendDM error:", err.message);
    }
  });

  /* DM TYPING START */
  socket.on("dm:typing:start", ({ conversationId, userId, name }) => {
    socket
      .to(`conversation:${conversationId}`)
      .emit("dm:typing:start", { userId, name });
  });

  /* DM TYPING STOP */
  socket.on("dm:typing:stop", ({ conversationId, userId }) => {
    socket
      .to(`conversation:${conversationId}`)
      .emit("dm:typing:stop", { userId });
  });

  /* =======================
     DISCONNECT
  ======================= */
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});
