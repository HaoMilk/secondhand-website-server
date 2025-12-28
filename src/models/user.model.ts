import mongoose, { Schema } from "mongoose";

export type UserRole = "admin" | "user";

// Schema cho địa chỉ giao hàng
const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    street: { type: String },
    note: { type: String },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true, timestamps: true }
);

// Schema cho thông tin người bán
const sellerInfoSchema = new Schema(
  {
    shopName: { type: String },
    tradingArea: { type: String },
    contactMethods: {
      internalChat: { type: Boolean, default: true },
      phone: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    },
    paymentMethods: {
      eWallet: { type: Boolean, default: false },
      bankTransfer: { type: Boolean, default: false },
      bankAccount: { type: String }
    },
    agreements: {
      termsAccepted: { type: Boolean, default: false },
      noProhibitedItems: { type: Boolean, default: false }
    }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["admin", "user"], 
      default: "user",
      required: true 
    },
    isLocked: { type: Boolean, default: false },
    // Thông tin cá nhân (bắt buộc)
    profile: {
      fullName: { type: String },
      phone: { type: String },
      phoneVerified: { type: Boolean, default: false },
      emailVerified: { type: Boolean, default: false },
      avatar: { type: String },
      address: {
        province: { type: String },
        district: { type: String },
        ward: { type: String },
        street: { type: String }
      }
    },
    // Địa chỉ giao hàng (nhiều địa chỉ)
    shippingAddresses: [shippingAddressSchema],
    // Thông tin người bán
    sellerInfo: sellerInfoSchema
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
