import mongoose, { Schema } from "mongoose";

/**
 * Shipping Address Interface
 */
export interface IShippingAddress {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street?: string;
  note?: string;
  isDefault: boolean; // Địa chỉ mặc định cho giao hàng
  isDefaultPickup?: boolean; // Địa chỉ mặc định cho lấy hàng
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Shipping Address Schema
 */
const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    street: { type: String, trim: true },
    note: { type: String, trim: true },
    isDefault: { type: Boolean, default: false }, // Địa chỉ mặc định cho giao hàng
    isDefaultPickup: { type: Boolean, default: false } // Địa chỉ mặc định cho lấy hàng
  },
  { timestamps: true }
);

// Indexes để tối ưu query
shippingAddressSchema.index({ userId: 1, isDefault: 1 });
shippingAddressSchema.index({ userId: 1 });

export const ShippingAddressModel = mongoose.model<IShippingAddress>(
  "ShippingAddress",
  shippingAddressSchema
);

