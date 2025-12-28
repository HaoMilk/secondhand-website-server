import type { Response } from "express";
import { categoryService, CategoryErrorCodes } from "../services/category.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { createCategorySchema } from "../validators/category.validator.js";

/**
 * Category Controller - Xử lý HTTP request/response cho Category
 */
export const categoryController = {
  /**
   * POST /api/v1/admin/categories
   * Tạo category mới
   * 
   * Auth: Bearer Token (ADMIN role)
   */
  async createCategory(req: AuthRequest, res: Response) {
    try {
      const adminId = req.userId;
      if (!adminId) {
        return res.status(401).json({
          success: false,
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      // Validate request body
      const validationResult = createCategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        // Format Zod errors thành fieldErrors
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((err) => {
          const path = err.path.join(".");
          fieldErrors[path] = err.message;
        });

        return res.status(422).json({
          success: false,
          code: CategoryErrorCodes.VALIDATION_ERROR,
          message: "Validation failed",
          details: { fieldErrors }
        });
      }

      // Tạo category
      const category = await categoryService.createCategory(adminId, validationResult.data);

      // Format response
      const categoryResponse = {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
        level: category.level,
        path: category.path,
        description: category.description,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdBy: category.createdBy,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };

      // Trả về response thành công
      return res.status(201).json({
        success: true,
        data: categoryResponse
      });
    } catch (error: any) {
      // Xử lý lỗi từ service
      const statusCode = error.statusCode || 500;
      const code = error.code || "SYSTEM_ERROR";
      const message = error.message || "Internal Server Error";
      const details = error.details || undefined;

      return res.status(statusCode).json({
        success: false,
        code,
        message,
        ...(details && { details })
      });
    }
  },

  /**
   * GET /api/v1/admin/categories
   * Lấy danh sách categories (cho admin)
   * 
   * Auth: Bearer Token (ADMIN role)
   */
  async getCategories(req: AuthRequest, res: Response) {
    try {
      const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
      const parentId = req.query.parentId as string | undefined;

      const categories = await categoryService.getCategories({
        isActive,
        parentId: parentId || null
      });

      // Format response
      const formattedCategories = categories.map((category) => ({
        _id: category._id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
        level: category.level,
        path: category.path,
        description: category.description,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdBy: category.createdBy,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }));

      return res.status(200).json({
        success: true,
        data: formattedCategories
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const code = error.code || "SYSTEM_ERROR";
      const message = error.message || "Internal Server Error";

      return res.status(statusCode).json({
        success: false,
        code,
        message
      });
    }
  },

  /**
   * GET /api/v1/categories/public
   * Lấy danh sách categories active (public, không cần auth)
   * 
   * Query params:
   * - parentId?: string | null (filter theo parentId)
   */
  async getPublicCategories(req: any, res: Response) {
    try {
      const parentId = req.query.parentId as string | undefined;

      const categories = await categoryService.getCategories({
        isActive: true, // Chỉ lấy categories active
        parentId: parentId || null
      });

      // Format response
      const formattedCategories = categories.map((category) => ({
        _id: category._id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
        level: category.level,
        path: category.path,
        description: category.description,
        isActive: category.isActive,
        sortOrder: category.sortOrder
      }));

      return res.status(200).json({
        success: true,
        data: formattedCategories
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const code = error.code || "SYSTEM_ERROR";
      const message = error.message || "Internal Server Error";

      return res.status(statusCode).json({
        success: false,
        code,
        message
      });
    }
  }
};

