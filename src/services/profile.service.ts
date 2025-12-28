import { userRepository } from "../repositories/user.repository.js";
import { logger } from "../utils/logger.js";

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
function hasDefaultShippingAddress(shippingAddresses: any[]): boolean {
  if (!shippingAddresses || shippingAddresses.length === 0) return false;
  return shippingAddresses.some(addr => addr.isDefault === true);
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
function calculateProfileCompletion(user: any): {
  percentage: number;
  missingFields: string[];
} {
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
  if (!hasDefaultShippingAddress(user.shippingAddresses)) {
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

    const completion = calculateProfileCompletion(user);

    return {
      profile: user.profile || {},
      shippingAddresses: user.shippingAddresses || [],
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
    if (!data.fullName || !data.phone || !data.address?.province || 
        !data.address?.district || !data.address?.ward) {
      const error = new Error("Missing required fields");
      (error as any).statusCode = 400;
      (error as any).code = ProfileErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    // Cập nhật profile
    user.profile = {
      fullName: data.fullName,
      phone: data.phone,
      phoneVerified: user.profile?.phoneVerified || false,
      emailVerified: user.profile?.emailVerified || false,
      avatar: data.avatar || user.profile?.avatar,
      address: {
        province: data.address.province,
        district: data.address.district,
        ward: data.address.ward,
        street: data.address.street || user.profile?.address?.street
      }
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

    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (data.isDefault) {
      if (user.shippingAddresses) {
        user.shippingAddresses.forEach(addr => {
          addr.isDefault = false;
        });
      }
    }

    // Thêm địa chỉ mới
    if (!user.shippingAddresses) {
      user.shippingAddresses = [];
    }

    const newAddress = {
      fullName: data.fullName,
      phone: data.phone,
      province: data.province,
      district: data.district,
      ward: data.ward,
      street: data.street,
      note: data.note,
      isDefault: data.isDefault || (user.shippingAddresses.length === 0)
    };

    user.shippingAddresses.push(newAddress as any);
    await user.save();

    logger.info(`Shipping address added for user ${userId}`);
    return newAddress;
  },

  /**
   * Cập nhật địa chỉ giao hàng
   */
  async updateShippingAddress(
    userId: string, 
    addressId: string, 
    data: Partial<ShippingAddressInput>
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    const address = user.shippingAddresses?.id(addressId);
    if (!address) {
      const error = new Error("Shipping address not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.SHIPPING_ADDRESS_NOT_FOUND;
      throw error;
    }

    // Cập nhật các trường
    if (data.fullName) address.fullName = data.fullName;
    if (data.phone) address.phone = data.phone;
    if (data.province) address.province = data.province;
    if (data.district) address.district = data.district;
    if (data.ward) address.ward = data.ward;
    if (data.street !== undefined) address.street = data.street;
    if (data.note !== undefined) address.note = data.note;

    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (data.isDefault === true) {
      user.shippingAddresses?.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
      address.isDefault = true;
    }

    await user.save();

    logger.info(`Shipping address updated for user ${userId}`);
    return address;
  },

  /**
   * Xóa địa chỉ giao hàng
   */
  async deleteShippingAddress(userId: string, addressId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    const address = user.shippingAddresses?.id(addressId);
    if (!address) {
      const error = new Error("Shipping address not found");
      (error as any).statusCode = 404;
      (error as any).code = ProfileErrorCodes.SHIPPING_ADDRESS_NOT_FOUND;
      throw error;
    }

    address.deleteOne();
    await user.save();

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

    if (!hasDefaultShippingAddress(user.shippingAddresses || [])) {
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
  calculateProfileCompletion
};

