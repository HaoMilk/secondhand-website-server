import { ShippingAddressModel } from "../models/shipping-address.model.js";
import type { IShippingAddress } from "../models/shipping-address.model.js";
import mongoose from "mongoose";

export const shippingAddressRepository = {
  /**
   * Tìm tất cả địa chỉ của user
   */
  findByUserId(userId: string) {
    return ShippingAddressModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ isDefault: -1, createdAt: -1 });
  },

  /**
   * Tìm địa chỉ theo ID
   */
  findById(addressId: string) {
    return ShippingAddressModel.findById(addressId);
  },

  /**
   * Tìm địa chỉ theo ID và User ID (đảm bảo user sở hữu địa chỉ)
   */
  findByIdAndUserId(addressId: string, userId: string) {
    return ShippingAddressModel.findOne({
      _id: new mongoose.Types.ObjectId(addressId),
      userId: new mongoose.Types.ObjectId(userId)
    });
  },

  /**
   * Tìm địa chỉ mặc định của user
   */
  findDefaultByUserId(userId: string) {
    return ShippingAddressModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      isDefault: true
    });
  },

  /**
   * Tạo địa chỉ mới
   */
  create(data: Omit<IShippingAddress, "createdAt" | "updatedAt">) {
    return ShippingAddressModel.create(data);
  },

  /**
   * Cập nhật địa chỉ
   */
  updateById(addressId: string, data: Partial<IShippingAddress>) {
    return ShippingAddressModel.findByIdAndUpdate(
      addressId,
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  /**
   * Xóa địa chỉ
   */
  deleteById(addressId: string) {
    return ShippingAddressModel.findByIdAndDelete(addressId);
  },

  /**
   * Bỏ mặc định tất cả địa chỉ của user (cho giao hàng)
   */
  unsetDefaultByUserId(userId: string) {
    return ShippingAddressModel.updateMany(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: { isDefault: false } }
    );
  },

  /**
   * Bỏ mặc định tất cả địa chỉ của user (cho lấy hàng)
   */
  unsetDefaultPickupByUserId(userId: string) {
    return ShippingAddressModel.updateMany(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: { isDefaultPickup: false } }
    );
  },

  /**
   * Xóa tất cả địa chỉ của user (khi xóa user)
   */
  deleteByUserId(userId: string) {
    return ShippingAddressModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
  }
};

