import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/connections
 * Returns categorized connections
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("connections.user", "name department year skills cardSkills")
      .select("connections");

    const incoming = [];
    const connected = [];
    const sent = [];

    user.connections.forEach((c) => {
      if (c.status === "accepted") {
        connected.push(c.user);
      } else if (c.status === "pending") {
        if (c.initiatedBy.toString() === req.user.id) {
          sent.push(c.user);
        } else {
          incoming.push(c.user);
        }
      }
    });

    res.json({
      incoming,
      connected,
      sent,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch connections" });
  }
});

/**
 * SEND CONNECTION REQUEST
 * POST /api/connections/request/:userId
 */
router.post("/request/:userId", authMiddleware, async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const toUserId = req.params.userId;

    if (fromUserId === toUserId) {
      return res.status(400).json({ message: "Cannot connect with yourself" });
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    fromUser.connections ||= [];
    toUser.connections ||= [];

    const alreadyExists = fromUser.connections.some(
      (c) => c.user.toString() === toUserId
    );

    if (alreadyExists) {
      return res.status(400).json({
        message: "Connection already exists or pending",
      });
    }

    fromUser.connections.push({
      user: toUserId,
      status: "pending",
      initiatedBy: fromUserId,
    });

    toUser.connections.push({
      user: fromUserId,
      status: "pending",
      initiatedBy: fromUserId,
    });

    await fromUser.save();
    await toUser.save();

    res.status(200).json({ message: "Connection request sent" });
  } catch (err) {
    console.error("Connection request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ACCEPT CONNECTION REQUEST
 * PATCH /api/connections/accept/:userId
 */
router.patch("/accept/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(otherUserId);

    if (!currentUser || !otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.connections ||= [];
    otherUser.connections ||= [];

    const existing = currentUser.connections.find(
      (c) => c.user.toString() === otherUserId
    );

    if (!existing || existing.status !== "pending") {
      return res.status(400).json({
        message: "No pending request to accept",
      });
    }

    if (existing.initiatedBy.toString() === currentUserId) {
      return res.status(400).json({
        message: "You cannot accept your own connection request",
      });
    }

    currentUser.connections = currentUser.connections.map((c) =>
      c.user.toString() === otherUserId ? { ...c, status: "accepted" } : c
    );

    otherUser.connections = otherUser.connections.map((c) =>
      c.user.toString() === currentUserId ? { ...c, status: "accepted" } : c
    );

    await currentUser.save();
    await otherUser.save();

    res.json({ message: "Connection accepted" });
  } catch (err) {
    console.error("Accept connection error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * REMOVE / REJECT CONNECTION
 * DELETE /api/connections/:userId
 */
router.delete("/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(otherUserId);

    if (!currentUser || !otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.connections ||= [];
    otherUser.connections ||= [];

    const exists = currentUser.connections.some(
      (c) => c.user.toString() === otherUserId
    );

    if (!exists) {
      return res.status(400).json({ message: "No connection exists" });
    }

    currentUser.connections = currentUser.connections.filter(
      (c) => c.user.toString() !== otherUserId
    );

    otherUser.connections = otherUser.connections.filter(
      (c) => c.user.toString() !== currentUserId
    );

    await currentUser.save();
    await otherUser.save();

    res.json({ message: "Connection removed" });
  } catch (err) {
    console.error("Remove connection error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
