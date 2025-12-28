import mongoose, { Schema } from "mongoose";

export type UserRole = "admin" | "user" | "seller";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["admin", "user", "seller"], 
      default: "user",
      required: true 
    }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
