import express from "express";
import Channel from "../models/Channel.js";
import Community from "../models/Community.js";
import CommunityMember from "../models/CommunityMember.js";
import Role from "../models/Role.js";
import authMiddleware from "../middlewares/authMiddleware.js";

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

    // Step 1: Find existing private channel
    const existingChannel = await Channel.findOne({
      type: "text",
      isDM: true,
      participants: { $all: [myId, otherUserId] },
    });

    if (existingChannel) {
      return res.json({
        communityId: existingChannel.communityId,
        channelId: existingChannel._id,
      });
    }

    // Step 2: Create DM Community
    const dmCommunity = await Community.create({
      name: "DM",
      ownerId: myId,
      isPrivate: true,
    });

    // Step 3: Create roles
    const role = await Role.create({
      communityId: dmCommunity._id,
      name: "Member",
      isDefault: true,
    });

    // Step 4: Add both users as members
    await CommunityMember.create([
      {
        communityId: dmCommunity._id,
        userId: myId,
        roleId: role._id,
      },
      {
        communityId: dmCommunity._id,
        userId: otherUserId,
        roleId: role._id,
      },
    ]);

    // Step 5: Create private channel
    const channel = await Channel.create({
      communityId: dmCommunity._id,
      name: "dm",
      type: "text",
      isDM: true,
      participants: [myId, otherUserId],
    });

    res.json({
      communityId: dmCommunity._id,
      channelId: channel._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
