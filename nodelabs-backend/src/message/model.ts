import mongoose, { Schema, model, Types } from "mongoose";

interface IMessage {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
}
export type { IMessage };

type MessageDocument = mongoose.HydratedDocument<IMessage>;

export type { MessageDocument };

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Message = model<IMessage>("Message", messageSchema);
