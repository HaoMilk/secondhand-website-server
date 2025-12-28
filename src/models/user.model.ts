import mongoose, { Schema } from "mongoose";
import { profileSchema } from "./profile.schema.js";
import { sellerInfoSchema } from "./seller-info.schema.js";

export type UserRole = "admin" | "user";

/**
 * User Interface
 */
export interface IUser {
  email: string;
  passwordHash: string;
  role: UserRole;
  isLocked: boolean;
  profile?: {
    fullName?: string;
    phone?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    avatar?: string;
    address?: {
      province?: string;
      district?: string;
      ward?: string;
      street?: string;
    };
  };
  sellerInfo?: {
    shopName?: string;
    tradingArea?: string;
    contactMethods?: {
      internalChat?: boolean;
      phone?: boolean;
      showPhone?: boolean;
    };
    paymentMethods?: {
      eWallet?: boolean;
      bankTransfer?: boolean;
      bankAccount?: string;
    };
    agreements?: {
      termsAccepted?: boolean;
      noProhibitedItems?: boolean;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User Schema
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
      index: true
    },
    isLocked: { type: Boolean, default: false },
    // Thông tin cá nhân (subdocument)
    profile: profileSchema,
    // Thông tin người bán (subdocument)
    sellerInfo: sellerInfoSchema
  },
  { timestamps: true }
);

// Indexes để tối ưu query
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const UserModel = mongoose.model<IUser>("User", userSchema);
