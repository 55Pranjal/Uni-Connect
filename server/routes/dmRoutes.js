import express from "express";
import Conversation from "../models/Conversation.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import Message from "../models/Message.js";

const router = express.Router();

/**
 * CREATE / OPEN DM
 * POST /api/dm/:userId
 */
router.post("/:userId", authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    if (myId === otherUserId) {
      return res.status(400).json({ message: "Cannot DM yourself" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [myId, otherUserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, otherUserId],
      });
    }

    res.json({
      conversationId: conversation._id,
    });
  } catch (err) {
    console.error("DM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET DM Messages
 * GET /api/dm/:conversationId/messages
 */
router.get("/:conversationId/messages", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify conversation exists
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Ensure user is part of conversation
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("GET DM MESSAGES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * SEND DM Message
 * POST /api/dm/:conversationId/messages
 */
router.post("/:conversationId/messages", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: "Message content required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      content,
    });

    await message.populate("senderId", "name avatar");

    // Update lastMessage in conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    console.error("SEND DM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
