import { CartModel, type ICart } from "../models/cart.model.js";
import type mongoose from "mongoose";

export const cartRepository = {
  /**
   * Tìm giỏ hàng theo userId
   */
  async findByUserId(userId: string) {
    return CartModel.findOne({ userId }).populate({
      path: "items.productId",
      populate: {
        path: "sellerId",
        select: "email"
      }
    });
  },

  /**
   * Tạo giỏ hàng mới
   */
  async create(data: Omit<ICart, "createdAt" | "updatedAt">) {
    return CartModel.create(data);
  },

  /**
   * Cập nhật giỏ hàng
   */
  async update(userId: string, items: ICart["items"]) {
    return CartModel.findOneAndUpdate(
      { userId },
      { items },
      { new: true, upsert: true }
    ).populate({
      path: "items.productId",
      populate: {
        path: "sellerId",
        select: "email"
      }
    });
  },

  /**
   * Xóa giỏ hàng
   */
  async delete(userId: string) {
    return CartModel.findOneAndDelete({ userId });
  },

  /**
   * Xóa một item khỏi giỏ hàng
   */
  async removeItem(userId: string, productId: string) {
    return CartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    ).populate({
      path: "items.productId",
      populate: {
        path: "sellerId",
        select: "email"
      }
    });
  }
};

