// models/Community.js
import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String, // URL or generated avatar seed
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },

    memberCount: {
      type: Number,
      default: 1,
    },

    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Community", communitySchema);
