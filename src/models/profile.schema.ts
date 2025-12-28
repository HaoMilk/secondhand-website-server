import { Schema } from "mongoose";

/**
 * Profile Address Schema
 */
export const profileAddressSchema = new Schema(
  {
    province: { type: String, trim: true },
    district: { type: String, trim: true },
    ward: { type: String, trim: true },
    street: { type: String, trim: true }
  },
  { _id: false }
);

/**
 * Profile Schema
 */
export const profileSchema = new Schema(
  {
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    avatar: { type: String, trim: true },
    address: profileAddressSchema
  },
  { _id: false }
);

