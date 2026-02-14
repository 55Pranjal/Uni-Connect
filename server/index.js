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
     JOIN COMMUNITY
  ======================= */
  socket.on("joinCommunity", (communityId) => {
    console.log("🏠 Joining community:", communityId);
    socket.join(`community:${communityId}`);
  });

  /* =======================
     JOIN CHANNEL
  ======================= */
  socket.on("joinChannel", (channelId) => {
    console.log("💬 Joining channel:", channelId);
    socket.join(`channel:${channelId}`);
  });

  /* =======================
     LEAVE CHANNEL
  ======================= */
  socket.on("leaveChannel", (channelId) => {
    console.log("🚪 Leaving channel:", channelId);
    socket.leave(`channel:${channelId}`);
  });

  /* =======================
     SEND MESSAGE
  ======================= */
  socket.on("sendMessage", async ({ messageId, channelId }) => {
    try {
      const message = await Message.findById(messageId).populate(
        "senderId",
        "name avatar",
      );

      if (!message) return;

      console.log("📨 Broadcasting message:", message._id);

      io.to(`channel:${channelId}`).emit("receiveMessage", message);
    } catch (err) {
      console.error("❌ Socket sendMessage error:", err.message);
    }
  });

  /* =======================
     TYPING INDICATOR (FIXED)
  ======================= */
  socket.on("typing:start", ({ channelId, userId, name }) => {
    console.log(
      "⌨️ typing:start from",
      name,
      "(" + userId + ")",
      "in",
      channelId,
    );

    socket.to(`channel:${channelId}`).emit("typing:start", {
      userId,
      name,
    });
  });

  socket.on("typing:stop", ({ channelId, userId }) => {
    console.log("⌨️ typing:stop from", userId, "in", channelId);

    socket.to(`channel:${channelId}`).emit("typing:stop", {
      userId,
    });
  });

  /* =======================
     MESSAGE DELETE
  ======================= */
  socket.on("message:delete", ({ messageId, channelId }) => {
    io.to(`channel:${channelId}`).emit("message:deleted", {
      messageId,
    });
  });

  /* =======================
     MESSAGE HELPFUL
  ======================= */
  socket.on("message:helpful", async ({ messageId, channelId }) => {
    try {
      const message = await Message.findById(messageId).populate(
        "senderId",
        "name avatar",
      );

      if (!message) return;

      io.to(`channel:${channelId}`).emit("message:helpful", {
        messageId,
        helpfulBy: message.feedback?.helpfulBy || [],
      });
    } catch (err) {
      console.error("❌ Socket helpful error:", err.message);
    }
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
