import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, default: 0 },
  },
  { _id: false }
);

const connectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,

    department: String,
    year: String,

    interests: [String], // separate from skills

    skills: [skillSchema],

    // skills shown on card (names only)
    cardSkills: {
      type: [String],
      default: [],
    },

    // skills shown on profile (names only)
    profileSkills: {
      type: [String],
      default: [],
    },

    topicsNeedHelp: String,

    bio: String,
    github: String,
    linkedin: String,

    // 🔗 CONNECTIONS
    connections: {
      type: [connectionSchema],
      default: [],
    },

    isOnboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
