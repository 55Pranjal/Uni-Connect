// models/Role.js
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },

    name: {
      type: String,
      required: true, // Owner, Member, Admin
    },

    priority: {
      type: Number,
      default: 0, // higher = more authority
    },

    permissions: {
      sendMessage: { type: Boolean, default: true },
      deleteMessage: { type: Boolean, default: false },
      manageChannels: { type: Boolean, default: false },
      manageMembers: { type: Boolean, default: false },
      createInvite: { type: Boolean, default: false },
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Role", roleSchema);
