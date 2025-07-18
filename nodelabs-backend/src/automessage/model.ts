import mongoose, { Types } from "mongoose";

interface IAutoMessage {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  sendDate: Date;
  isQueued?: boolean;
  isSent?: boolean;
  createdAt?: Date;
}
export type { IAutoMessage };

type AutoMessageDocument = mongoose.HydratedDocument<IAutoMessage>;

export type { AutoMessageDocument };

const AutoMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  sendDate: { type: Date, required: true },
  isQueued: { type: Boolean, default: false },
  isSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const AutoMessage = mongoose.model<IAutoMessage>(
  "AutoMessage",
  AutoMessageSchema
);

export { AutoMessage };
