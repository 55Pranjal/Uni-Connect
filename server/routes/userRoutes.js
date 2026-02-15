import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getConnectionStatus } from "../utils/connectionStatus.js";

const router = express.Router();

/* ============ UPDATE PROFILE / ONBOARDING ============ */
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      department,
      year,
      interests,
      skillsCanHelp,
      topicsNeedHelp,
      bio,
      github,
      linkedin,
    } = req.body;

    const updateFields = {};

    // ---------- BASIC PROFILE ----------
    if (department !== undefined) updateFields.department = department;
    if (year !== undefined) updateFields.year = year;
    if (interests !== undefined) updateFields.interests = interests;
    if (topicsNeedHelp !== undefined)
      updateFields.topicsNeedHelp = topicsNeedHelp;

    // ---------- ABOUT ----------
    if (bio !== undefined) updateFields.bio = bio;
    if (github !== undefined) updateFields.github = github;
    if (linkedin !== undefined) updateFields.linkedin = linkedin;

    // ---------- SKILLS (ONLY DURING ONBOARDING) ----------
    if (Array.isArray(skillsCanHelp)) {
      updateFields.skills = skillsCanHelp.map((skill) => ({
        name: skill,
        level: 0, // initial level
      }));
      updateFields.isOnboarded = true;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    }).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    const me = user.toObject();
    me.avatarSeed = me._id.toString();

    me.connectionsCount =
      user.connections?.filter((c) => c.status === "accepted").length || 0;

    res.status(200).json({ user: me });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.patch("/card-skills", authMiddleware, async (req, res) => {
  try {
    const { cardSkills } = req.body;

    if (!Array.isArray(cardSkills) || cardSkills.length !== 3) {
      return res.status(400).json({
        message: "Exactly 3 skills must be selected",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cardSkills },
      { new: true },
    );

    res.json({
      message: "Card skills updated",
      cardSkills: user.cardSkills,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/profile-skills", authMiddleware, async (req, res) => {
  try {
    const { profileSkills } = req.body;

    // Validation
    if (!Array.isArray(profileSkills)) {
      return res.status(400).json({
        message: "profileSkills must be an array",
      });
    }

    if (profileSkills.length > 4) {
      return res.status(400).json({
        message: "You can select a maximum of 4 profile skills",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileSkills },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Profile skills updated successfully",
      profileSkills: user.profileSkills,
    });
  } catch (error) {
    console.error("Profile skills update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile skills",
    });
  }
});

/**
 * GET /api/user/search?q=pranjal
 */
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({ users: [] });
    }

    const currentUser = await User.findById(req.user.id);

    const users = await User.find({
      name: { $regex: q, $options: "i" },
      _id: { $ne: req.user.id },
    })
      .select("name department year skills cardSkills avatarSeed")
      .limit(10);

    const enrichedUsers = users.map((u) => ({
      ...u.toObject(),
      avatarSeed: u._id.toString(),
      connectionStatus: getConnectionStatus(currentUser, u._id.toString()),
    }));

    res.status(200).json({ users: enrichedUsers });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

/**
 * GET /api/user/public/:id
 * Public profile (NO auth)
 */
router.get("/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select(
        "name department year bio github linkedin skills cardSkills profileSkills connections",
      )
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionsCount =
      user.connections?.filter((c) => c.status === "accepted").length || 0;

    const resolvedCardSkills = Array.isArray(user.cardSkills)
      ? user.skills.filter((s) => user.cardSkills.includes(s.name))
      : [];

    const resolvedProfileSkills = Array.isArray(user.profileSkills)
      ? user.skills.filter((s) => user.profileSkills.includes(s.name))
      : [];

    res.status(200).json({
      _id: id,
      ...user,
      avatarSeed: id,
      connectionsCount,
      cardSkills: resolvedCardSkills,
      profileSkills: resolvedProfileSkills,
    });
  } catch (error) {
    console.error("Public profile fetch error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

/**
 * GET /api/user/:id
 * Authenticated profile (USED FOR CHAT)
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileUser = user.toObject();
    profileUser.avatarSeed = profileUser._id.toString();

    profileUser.connectionStatus = getConnectionStatus(
      currentUser,
      profileUser._id.toString(),
    );

    // 🔥 IMPORTANT: return USER DIRECTLY
    res.status(200).json(profileUser);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

export default router;
