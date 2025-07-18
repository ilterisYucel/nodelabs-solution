import mongoose, { Schema, model, Types } from "mongoose";

interface IConversation {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
}

export type { IConversation };

type ConversationDocument = mongoose.HydratedDocument<IConversation>;

export type { ConversationDocument };

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

export { conversationSchema };

export const Conversation = model<IConversation>("Conversation", conversationSchema);
