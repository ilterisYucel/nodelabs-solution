import mongoose from "mongoose";

interface IUser {
  email: string;
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  lastActiveAt?: Date;
  online?: boolean;
}

export type { IUser };

type UserDocument = mongoose.HydratedDocument<IUser>;

export type { UserDocument };

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["regular", "admin"],
      default: "regular",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // For faster queries
    },
    lastActiveAt: {
      type: Date,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.virtual("online").get(function () {
  return this.lastActiveAt
    ? Date.now() - this.lastActiveAt.getTime() < 5 * 60 * 1000 // 5 min threshold
    : false;
});

export { userSchema };

const User = mongoose.model<IUser>("user", userSchema);

export { User };
