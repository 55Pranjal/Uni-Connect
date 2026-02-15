import express from "express";
import mongoose from "mongoose";
import slugify from "slugify";
import Community from "../models/Community.js";
import CommunityMember from "../models/CommunityMember.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
=========================================
CREATE COMMUNITY
POST /api/community
=========================================
*/
router.post("/", authMiddleware, async (req, res) => {
  console.log("CREATE COMMUNITY ROUTE HIT");
  try {
    console.log("User:", req.user);
    console.log("Body:", req.body);
    const { name, description, category, isPrivate } = req.body;

    // ⚠️ Make sure your JWT contains `id`
    const userId = req.user.id;
    console.log("UserId:", userId);

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category required" });
    }

    // Limit creator to max 2 communities
    const createdCount = await Community.countDocuments({ ownerId: userId });
    console.log("Created Count:", createdCount);

    if (createdCount >= 2) {
      return res.status(400).json({
        message: "You can only create up to 2 communities",
      });
    }

    // Generate slug
    let slug = slugify(name, { lower: true, strict: true });

    const existingSlug = await Community.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const community = await Community.create({
      name,
      description,
      category,
      isPrivate: isPrivate || false,
      ownerId: userId,
      slug,
      memberCount: 1,
    });

    // Add creator as member (replace roleId properly)
    await CommunityMember.create({
      communityId: community._id,
      userId,
      role: "admin",
      joinedVia: "owner",
    });

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
=========================================
GET PUBLIC COMMUNITIES (DISCOVER)
GET /api/community
=========================================
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const communities = await Community.find({ isPrivate: false }).sort({
      createdAt: -1,
    });

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
=========================================
GET MY COMMUNITIES
GET /api/community/my
=========================================
*/
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await CommunityMember.find({ userId }).populate(
      "communityId",
    );

    const communities = memberships.map((m) => m.communityId);

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
=========================================
JOIN COMMUNITY (PUBLIC ONLY)
POST /api/community/:id/join
=========================================
*/
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.isPrivate) {
      return res.status(403).json({
        message: "Private community. Invitation required.",
      });
    }

    // Check if already joined
    const existing = await CommunityMember.findOne({
      communityId,
      userId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already a member" });
    }

    await CommunityMember.create({
      communityId,
      userId,
      role: "member",
      joinedVia: "invite",
    });

    community.memberCount += 1;
    await community.save();

    res.json({ message: "Joined successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
