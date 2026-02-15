import express from "express";
import Message from "../models/Message.js";
import Channel from "../models/Channel.js";
import CommunityMember from "../models/CommunityMember.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ======================================================
   SEND MESSAGE
   POST /api/channels/:channelId/messages
====================================================== */
router.post("/:channelId/messages", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const { channelId } = req.params;
    const userId = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const member = await CommunityMember.findOne({
      communityId: channel.communityId,
      userId,
      status: "active",
    }).populate("roleId");

    if (!member) {
      return res.status(403).json({ message: "Not a community member" });
    }

    if (!member.roleId?.permissions?.sendMessage) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Create message
    const message = await Message.create({
      channelId,
      senderId: userId,
      content,
    });

    // 🔥 Populate sender before sending response
    const populatedMessage = await message.populate("senderId", "name avatar");

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   GET CHANNEL MESSAGES
   GET /api/channels/:channelId/messages
====================================================== */
router.get("/:channelId/messages", authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const member = await CommunityMember.findOne({
      communityId: channel.communityId,
      userId,
      status: "active",
    });

    if (!member) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({ channelId })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   DELETE MESSAGE
   DELETE /api/channels/messages/:messageId
====================================================== */
router.delete("/messages/:messageId", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const channel = await Channel.findById(message.channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const member = await CommunityMember.findOne({
      communityId: channel.communityId,
      userId: req.user.id,
      status: "active",
    }).populate("roleId");

    if (!member) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const isSender = message.senderId.toString() === req.user.id;

    const canDelete = member.roleId?.permissions?.deleteMessage;

    if (!isSender && !canDelete) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await message.deleteOne();

    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   MARK MESSAGE AS HELPFUL
   POST /api/channels/messages/:messageId/helpful
====================================================== */
router.post(
  "/messages/:messageId/helpful",
  authMiddleware,
  async (req, res) => {
    try {
      const message = await Message.findById(req.params.messageId);

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Ensure feedback object exists
      if (!message.feedback) {
        message.feedback = {
          helpfulBy: [],
        };
      }

      const alreadyMarked = message.feedback.helpfulBy.some(
        (id) => id.toString() === req.user.id,
      );

      if (!alreadyMarked) {
        message.feedback.helpfulBy.push(req.user.id);
        await message.save();
      }

      res.json({ message: "Marked helpful" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

export default router;
