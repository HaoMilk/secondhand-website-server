import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

export const categoryRouter = Router();

/**
 * POST /api/v1/admin/categories
 * Tạo category mới
 * 
 * Requirements:
 * - Authentication: Bearer Token
 * - Authorization: ADMIN role
 */
categoryRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  categoryController.createCategory.bind(categoryController)
);

/**
 * GET /api/v1/admin/categories
 * Lấy danh sách categories (cho admin)
 * 
 * Query params:
 * - isActive?: boolean (filter theo isActive)
 * - parentId?: string | null (filter theo parentId)
 * 
 * Requirements:
 * - Authentication: Bearer Token
 * - Authorization: ADMIN role
 */
categoryRouter.get(
  "/",
  authenticate,
  authorize("admin"),
  categoryController.getCategories.bind(categoryController)
);

/**
 * GET /api/v1/categories/public
 * Lấy danh sách categories active (public, không cần auth)
 * 
 * Query params:
 * - parentId?: string | null (filter theo parentId)
 */
categoryRouter.get(
  "/public",
  categoryController.getPublicCategories.bind(categoryController)
);

