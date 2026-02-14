import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "announcement"],
      default: "text",
    },

    skillTag: {
      type: String, // e.g. "React", "DSA", "UI/UX"
      index: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// 🔥 Prevent duplicate channel names inside same community
channelSchema.index({ communityId: 1, name: 1 }, { unique: true });

export default mongoose.model("Channel", channelSchema);
