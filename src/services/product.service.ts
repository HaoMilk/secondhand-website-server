import { productRepository } from "../repositories/product.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { createProductSchema, type CreateProductInput } from "../validators/product.validator.js";
import { logger } from "../utils/logger.js";
import { profileService } from "./profile.service.js";
import type mongoose from "mongoose";

/**
 * Error codes cho Product module
 */
export const ProductErrorCodes = {
  USER_NOT_FOUND: "PRODUCT_USER_NOT_FOUND",
  USER_LOCKED: "PRODUCT_USER_LOCKED",
  VALIDATION_ERROR: "PRODUCT_VALIDATION_ERROR",
  CATEGORY_NOT_FOUND: "PRODUCT_CATEGORY_NOT_FOUND",
  PROFILE_INCOMPLETE: "PROFILE_INCOMPLETE"
} as const;

/**
 * Product Service - Xử lý business logic cho sản phẩm
 */
export const productService = {
  /**
   * Tạo sản phẩm mới
   * 
   * Business Rules:
   * - User phải đăng nhập và không bị khóa
   * - USER role: tạo sản phẩm → status = "approved" (tự động duyệt)
   * - Validation đầy đủ theo yêu cầu
   * - Ghi log hành động
   */
  async createProduct(userId: string, input: CreateProductInput) {
    // 1. Kiểm tra user tồn tại và không bị khóa
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = ProductErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    if (user.isLocked) {
      const error = new Error("User account is locked");
      (error as any).statusCode = 403;
      (error as any).code = ProductErrorCodes.USER_LOCKED;
      throw error;
    }

    // 2. Kiểm tra profile đã hoàn thiện chưa
    const canSellResult = await profileService.canSell(userId);
    if (!canSellResult.canSell) {
      const error = new Error("Profile incomplete. Please complete your profile before selling.");
      (error as any).statusCode = 400;
      (error as any).code = ProductErrorCodes.PROFILE_INCOMPLETE;
      (error as any).reason = canSellResult.reason;
      (error as any).missingFields = canSellResult.missingFields;
      throw error;
    }

    // 3. Validate input data
    const validationResult = createProductSchema.safeParse(input);
    if (!validationResult.success) {
      const error = new Error("Validation failed");
      (error as any).statusCode = 400;
      (error as any).code = ProductErrorCodes.VALIDATION_ERROR;
      (error as any).details = validationResult.error.errors;
      throw error;
    }

    const validatedData = validationResult.data;

    // 4. Kiểm tra categoryId hợp lệ (có thể mở rộng để check với Category model)
    // TODO: Implement category validation khi có Category model
    // const category = await categoryRepository.findById(validatedData.categoryId);
    // if (!category) {
    //   const error = new Error("Category not found");
    //   (error as any).statusCode = 404;
    //   (error as any).code = ProductErrorCodes.CATEGORY_NOT_FOUND;
    //   throw error;
    // }

    // 4. Xác định status: USER role → approved (tự động duyệt)
    const status = "approved"; // Theo yêu cầu: USER tạo sản phẩm → approved

    // 5. Tạo sản phẩm
    const product = await productRepository.create({
      ...validatedData,
      categoryId: validatedData.categoryId as unknown as mongoose.Types.ObjectId,
      sellerId: userId as unknown as mongoose.Types.ObjectId,
      quantity: validatedData.quantity ?? 1,
      status,
      isAvailable: true
    });

    // 7. Ghi log hành động
    logger.logProductCreated(product._id.toString(), userId, product.title);

    // 8. Trả về sản phẩm đã tạo
    return product;
  },

  /**
   * Lấy danh sách sản phẩm của user
   */
  async getMyProducts(userId: string) {
    // Kiểm tra user tồn tại
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = ProductErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    // Lấy danh sách sản phẩm
    const products = await productRepository.findBySellerId(userId);
    return products;
  },

  /**
   * Lấy tất cả sản phẩm đã được duyệt với phân trang (public)
   */
  async getAllProducts(page: number = 1, limit: number = 9) {
    const result = await productRepository.findAllPaginated(page, limit);
    return result;
  }
};

