// models/CommunityMember.js
import mongoose from "mongoose";

const communityMemberSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "member", "moderator"],
      default: "member",
    },

    status: {
      type: String,
      enum: ["active", "muted", "banned"],
      default: "active",
    },

    joinedVia: {
      type: String,
      enum: ["invite", "approval", "owner"],
      default: "invite",
    },
  },
  { timestamps: true },
);

communityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });

export default mongoose.model("CommunityMember", communityMemberSchema);
