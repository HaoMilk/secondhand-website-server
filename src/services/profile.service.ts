import { userRepository } from "../repositories/user.repository.js";
import { shippingAddressRepository } from "../repositories/shipping-address.repository.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

/**
 * Error codes cho Profile module
 */
export const ProfileErrorCodes = {
  USER_NOT_FOUND: "PROFILE_USER_NOT_FOUND",
  VALIDATION_ERROR: "PROFILE_VALIDATION_ERROR",
  PROFILE_INCOMPLETE: "PROFILE_INCOMPLETE",
  SHIPPING_ADDRESS_NOT_FOUND: "SHIPPING_ADDRESS_NOT_FOUND"
} as const;

/**
 * Interface cho thông tin profile cơ bản
 */
export interface ProfileBasicInfo {
  fullName: string;
  phone: string;
  avatar?: string;
  address: {
    province: string;
    district: string;
    ward: string;
    street?: string;
  };
}

/**
 * Interface cho địa chỉ giao hàng
 */
export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street?: string;
  note?: string;
  isDefault?: boolean;
}

/**
 * Interface cho thông tin người bán
 */
export interface SellerInfoInput {
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
}

/**
 * Kiểm tra profile cơ bản đã hoàn thiện chưa
 */
function isBasicProfileComplete(profile: any): boolean {
  if (!profile) return false;
  
  return !!(
    profile.fullName &&
    profile.phone &&
    profile.address?.province &&
    profile.address?.district &&
    profile.address?.ward
  );
}

/**
 * Kiểm tra có địa chỉ giao hàng mặc định chưa
 */
async function hasDefaultShippingAddress(userId: string): Promise<boolean> {
  const defaultAddress = await shippingAddressRepository.findDefaultByUserId(userId);
  return !!defaultAddress;
}

/**
 * Kiểm tra thông tin người bán đã hoàn thiện chưa
 */
function isSellerInfoComplete(sellerInfo: any): boolean {
  if (!sellerInfo) return false;
  
  return !!(
    sellerInfo.shopName &&
    sellerInfo.tradingArea &&
    sellerInfo.agreements?.termsAccepted === true &&
    sellerInfo.agreements?.noProhibitedItems === true
  );
}

/**
 * Tính % hoàn thiện hồ sơ
 */
async function calculateProfileCompletion(user: any, shippingAddresses: any[]): Promise<{
  percentage: number;
  missingFields: string[];
}> {
  const missingFields: string[] = [];
  let completedFields = 0;
  const totalFields = 7; // Tổng số trường cần thiết

  // Thông tin cơ bản
  if (!user.profile?.fullName) missingFields.push("Họ và tên");
  else completedFields++;

  if (!user.profile?.phone) missingFields.push("Số điện thoại");
  else completedFields++;

  if (!user.profile?.address?.province) missingFields.push("Tỉnh/Thành phố");
  else completedFields++;

  if (!user.profile?.address?.district) missingFields.push("Quận/Huyện");
  else completedFields++;

  if (!user.profile?.address?.ward) missingFields.push("Phường/Xã");
  else completedFields++;

  if (!user.profile?.avatar) missingFields.push("Ảnh đại diện");
  else completedFields++;

  // Địa chỉ giao hàng mặc định
  const hasDefault = shippingAddresses.some(addr => addr.isDefault === true);
  if (!hasDefault) {
    missingFields.push("Địa chỉ giao hàng mặc định");
  } else {
    completedFields++;
  }

  const percentage = Math.round((completedFields / totalFields) * 100);

  return { percentage, missingFields };
}

/**
 * Profile Service - Xử lý business logic cho profile
 */
export const profileService = {
  /**
   * Lấy thông tin profile của user
   */
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    // Lấy địa chỉ giao hàng từ collection riêng
    const shippingAddresses = await shippingAddressRepository.findByUserId(userId);
    
    const completion = await calculateProfileCompletion(user, shippingAddresses);

    return {
      profile: user.profile || {},
      shippingAddresses: shippingAddresses.map(addr => ({
        _id: addr._id.toString(),
        fullName: addr.fullName,
        phone: addr.phone,
        province: addr.province,
        district: addr.district,
        ward: addr.ward,
        street: addr.street,
        note: addr.note,
        isDefault: addr.isDefault,
        isDefaultShipping: addr.isDefault,
        isDefaultPickup: addr.isDefaultPickup || false
      })),
      sellerInfo: user.sellerInfo || {},
      completion
    };
  },

  /**
   * Cập nhật thông tin cá nhân cơ bản
   */
  async updateBasicInfo(userId: string, data: ProfileBasicInfo) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    // Validate
    if (!data.fullName || !data.phone) {
      const error = new Error("Missing required fields: fullName and phone are required");
      (error as any).statusCode = 400;
      (error as any).code = ProfileErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    // Nếu không có địa chỉ trong request, thử lấy từ địa chỉ giao hàng mặc định
    let addressData = data.address;
    if (!addressData || !addressData.province || !addressData.district || !addressData.ward) {
      const defaultShippingAddress = await shippingAddressRepository.findDefaultByUserId(userId);
      if (defaultShippingAddress) {
        addressData = {
          province: defaultShippingAddress.province,
          district: defaultShippingAddress.district,
          ward: defaultShippingAddress.ward,
          street: defaultShippingAddress.street
        };
        logger.info(`Using default shipping address for profile.address for user ${userId}`);
      } else if (user.profile?.address) {
        // Giữ nguyên địa chỉ cũ nếu có
        addressData = {
          province: user.profile.address.province,
          district: user.profile.address.district,
          ward: user.profile.address.ward,
          street: user.profile.address.street
        };
      }
    }

    // Cập nhật profile
    user.profile = {
      fullName: data.fullName,
      phone: data.phone,
      phoneVerified: user.profile?.phoneVerified || false,
      emailVerified: user.profile?.emailVerified || false,
      avatar: data.avatar || user.profile?.avatar,
      address: addressData ? {
        province: addressData.province,
        district: addressData.district,
        ward: addressData.ward,
        street: addressData.street || user.profile?.address?.street
      } : user.profile?.address
    };

    await user.save();

    logger.info(`Profile basic info updated for user ${userId}`);
    return user.profile;
  },

  /**
   * Thêm địa chỉ giao hàng
   */
  async addShippingAddress(userId: string, data: ShippingAddressInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    // Validate
    if (!data.fullName || !data.phone || !data.province || 
        !data.district || !data.ward) {
      const error = new Error("Missing required fields");
      (error as any).statusCode = 400;
      (error as any).code = ProfileErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    // Kiểm tra xem có địa chỉ nào chưa
    const existingAddresses = await shippingAddressRepository.findByUserId(userId);
    const isFirstAddress = existingAddresses.length === 0;
    const isDefaultPickup = (data as any).isDefaultPickup || false;

    // Nếu đặt làm mặc định giao hàng, bỏ mặc định của các địa chỉ khác
    if (data.isDefault || isFirstAddress) {
      await shippingAddressRepository.unsetDefaultByUserId(userId);
    }

    // Nếu đặt làm mặc định lấy hàng, bỏ mặc định của các địa chỉ khác
    if (isDefaultPickup) {
      await shippingAddressRepository.unsetDefaultPickupByUserId(userId);
    }

    // Tạo địa chỉ mới
    const newAddress = await shippingAddressRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      fullName: data.fullName,
      phone: data.phone,
      province: data.province,
      district: data.district,
      ward: data.ward,
      street: data.street,
      note: data.note,
      isDefault: data.isDefault !== undefined ? data.isDefault : isFirstAddress,
      isDefaultPickup: (data as any).isDefaultPickup || false
    });

    logger.info(`Shipping address added for user ${userId}`);
    return {
      _id: newAddress._id.toString(),
      fullName: newAddress.fullName,
      phone: newAddress.phone,
      province: newAddress.province,
      district: newAddress.district,
      ward: newAddress.ward,
      street: newAddress.street,
      note: newAddress.note,
      isDefault: newAddress.isDefault,
      isDefaultShipping: newAddress.isDefault,
      isDefaultPickup: newAddress.isDefaultPickup || false
    };
  },

  /**
   * Cập nhật địa chỉ giao hàng
   */
  async updateShippingAddress(
    userId: string, 
    addressId: string, 
    data: Partial<ShippingAddressInput>
  ) {
    // Kiểm tra địa chỉ thuộc về user
    const address = await shippingAddressRepository.findByIdAndUserId(addressId, userId);
    if (!address) {
      const error = new Error("Shipping address not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.SHIPPING_ADDRESS_NOT_FOUND;
      throw error;
    }

    // Nếu đặt làm mặc định giao hàng, bỏ mặc định của các địa chỉ khác
    if (data.isDefault === true) {
      await shippingAddressRepository.unsetDefaultByUserId(userId);
    }

    // Nếu đặt làm mặc định lấy hàng, bỏ mặc định của các địa chỉ khác
    if ((data as any).isDefaultPickup === true) {
      await shippingAddressRepository.unsetDefaultPickupByUserId(userId);
    }

    // Cập nhật các trường
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.ward !== undefined) updateData.ward = data.ward;
    if (data.street !== undefined) updateData.street = data.street;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if ((data as any).isDefaultPickup !== undefined) updateData.isDefaultPickup = (data as any).isDefaultPickup;

    const updatedAddress = await shippingAddressRepository.updateById(addressId, updateData);
    if (!updatedAddress) {
      const error = new Error("Failed to update shipping address");
      (error as any).statusCode = 500;
      (error as any).code = ProfileErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    logger.info(`Shipping address updated for user ${userId}`);
    return {
      _id: updatedAddress._id.toString(),
      fullName: updatedAddress.fullName,
      phone: updatedAddress.phone,
      province: updatedAddress.province,
      district: updatedAddress.district,
      ward: updatedAddress.ward,
      street: updatedAddress.street,
      note: updatedAddress.note,
      isDefault: updatedAddress.isDefault,
      isDefaultShipping: updatedAddress.isDefault,
      isDefaultPickup: updatedAddress.isDefaultPickup || false
    };
  },

  /**
   * Xóa địa chỉ giao hàng
   */
  async deleteShippingAddress(userId: string, addressId: string) {
    // Kiểm tra địa chỉ thuộc về user
    const address = await shippingAddressRepository.findByIdAndUserId(addressId, userId);
    if (!address) {
      const error = new Error("Shipping address not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.SHIPPING_ADDRESS_NOT_FOUND;
      throw error;
    }

    await shippingAddressRepository.deleteById(addressId);

    logger.info(`Shipping address deleted for user ${userId}`);
    return { success: true };
  },

  /**
   * Cập nhật thông tin người bán
   */
  async updateSellerInfo(userId: string, data: SellerInfoInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    // Validate
    if (data.agreements) {
      if (data.agreements.termsAccepted !== true || 
          data.agreements.noProhibitedItems !== true) {
        const error = new Error("Must accept all agreements");
        (error as any).statusCode = 400;
        (error as any).code = ProfileErrorCodes.VALIDATION_ERROR;
        throw error;
      }
    }

    // Cập nhật seller info
    if (!user.sellerInfo) {
      user.sellerInfo = {} as any;
    }

    if (data.shopName !== undefined) user.sellerInfo.shopName = data.shopName;
    if (data.tradingArea !== undefined) user.sellerInfo.tradingArea = data.tradingArea;
    
    if (data.contactMethods) {
      user.sellerInfo.contactMethods = {
        ...user.sellerInfo.contactMethods,
        ...data.contactMethods
      };
    }

    if (data.paymentMethods) {
      user.sellerInfo.paymentMethods = {
        ...user.sellerInfo.paymentMethods,
        ...data.paymentMethods
      };
    }

    if (data.agreements) {
      user.sellerInfo.agreements = {
        ...user.sellerInfo.agreements,
        ...data.agreements
      };
    }

    await user.save();

    logger.info(`Seller info updated for user ${userId}`);
    return user.sellerInfo;
  },

  /**
   * Kiểm tra profile đã đủ điều kiện để đăng bán chưa
   */
  async canSell(userId: string): Promise<{ canSell: boolean; reason?: string; missingFields?: string[] }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      return { canSell: false, reason: "User not found" };
    }

    if (!isBasicProfileComplete(user.profile)) {
      return { 
        canSell: false, 
        reason: "PROFILE_INCOMPLETE",
        missingFields: ["Thông tin cá nhân chưa hoàn thiện"]
      };
    }

    if (!isSellerInfoComplete(user.sellerInfo)) {
      return { 
        canSell: false, 
        reason: "PROFILE_INCOMPLETE",
        missingFields: ["Thông tin người bán chưa hoàn thiện"]
      };
    }

    return { canSell: true };
  },

  /**
   * Kiểm tra profile đã đủ điều kiện để mua hàng chưa
   */
  async canBuy(userId: string): Promise<{ canBuy: boolean; reason?: string; missingFields?: string[] }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      return { canBuy: false, reason: "User not found" };
    }

    if (!isBasicProfileComplete(user.profile)) {
      return { 
        canBuy: false, 
        reason: "PROFILE_INCOMPLETE",
        missingFields: ["Thông tin cá nhân chưa hoàn thiện"]
      };
    }

    const hasDefault = await hasDefaultShippingAddress(userId);
    if (!hasDefault) {
      return { 
        canBuy: false, 
        reason: "PROFILE_INCOMPLETE",
        missingFields: ["Chưa có địa chỉ giao hàng mặc định"]
      };
    }

    return { canBuy: true };
  },

  /**
   * Tính % hoàn thiện hồ sơ
   */
  async calculateProfileCompletion(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      return { percentage: 0, missingFields: ["User not found"] };
    }
    const shippingAddresses = await shippingAddressRepository.findByUserId(userId);
    return await calculateProfileCompletion(user, shippingAddresses);
  }
};

