import mongoose, { Schema } from "mongoose";

/**
 * Product Condition Enum
 * - new-like: Như mới
 * - very-good: Rất tốt
 * - good: Tốt
 * - fair: Khá (có khuyết điểm)
 */
export type ProductCondition = "new-like" | "very-good" | "good" | "fair";

/**
 * Product Status Enum
 * - draft: Bản nháp
 * - pending: Chờ duyệt
 * - approved: Đã duyệt
 * - rejected: Từ chối
 */
export type ProductStatus = "draft" | "pending" | "approved" | "rejected";

export interface IProduct {
  title: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  gender?: "male" | "female" | "unisex";
  style?: string;
  price: number;
  condition: ProductCondition;
  defects?: string;
  defectImages?: string[];
  images: string[];
  quantity: number;
  sellerId: mongoose.Types.ObjectId;
  authenticity?: boolean;
  status: ProductStatus;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    categoryId: { type: Schema.Types.ObjectId, required: true, ref: "Category" },
    brand: { type: String, trim: true },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    material: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "unisex"] },
    style: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      enum: ["new-like", "very-good", "good", "fair"],
      required: true
    },
    defects: { type: String, trim: true },
    defectImages: [{ type: String }],
    images: [{ type: String, required: true }],
    quantity: { type: Number, default: 1, min: 0 },
    sellerId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    authenticity: { type: Boolean },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "pending"
    },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Indexes để tối ưu query
productSchema.index({ sellerId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isAvailable: 1 });

export const ProductModel = mongoose.model<IProduct>("Product", productSchema);

