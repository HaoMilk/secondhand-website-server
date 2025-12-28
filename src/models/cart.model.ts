import mongoose, { Schema } from "mongoose";

/**
 * Cart Item Interface
 */
export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

/**
 * Cart Interface
 */
export interface ICart {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Cart Item Schema (subdocument)
 */
const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product"
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  },
  { _id: false }
);

/**
 * Cart Schema
 */
const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
      index: true
    },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

// Index để tối ưu query
cartSchema.index({ userId: 1 });

export const CartModel = mongoose.model<ICart>("Cart", cartSchema);

