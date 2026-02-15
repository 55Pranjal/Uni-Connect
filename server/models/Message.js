import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Community messages
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      index: true,
    },

    // DM messages
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },

    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    feedback: {
      helpfulBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      solvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  { timestamps: true },
);

messageSchema.pre("validate", function () {
  if (!this.channelId && !this.conversationId) {
    throw new Error("Message must belong to either channel or conversation");
  }

  if (this.channelId && this.conversationId) {
    throw new Error("Message cannot belong to both channel and conversation");
  }
});

export default mongoose.model("Message", messageSchema);
