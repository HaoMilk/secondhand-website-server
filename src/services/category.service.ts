import { categoryRepository } from "../repositories/category.repository.js";
import type { CreateCategoryInput } from "../validators/category.validator.js";
import { slugify } from "../utils/slugify.js";
import type mongoose from "mongoose";

/**
 * Error codes cho Category module
 */
export const CategoryErrorCodes = {
  VALIDATION_ERROR: "CATEGORY_INVALID_INPUT",
  DUPLICATE: "CATEGORY_DUPLICATE",
  PARENT_NOT_FOUND: "CATEGORY_PARENT_NOT_FOUND",
  PARENT_INACTIVE: "CATEGORY_PARENT_INACTIVE",
  MAX_LEVEL_EXCEEDED: "CATEGORY_MAX_LEVEL_EXCEEDED"
} as const;

/**
 * Category Service - Xử lý business logic cho category
 */
export const categoryService = {
  /**
   * Tạo category mới
   * 
   * Business Rules:
   * - Admin phải đăng nhập
   * - slug được tạo tự động từ name và phải unique
   * - Nếu có parentId: parent phải tồn tại và isActive = true
   * - level = parent.level + 1 (nếu có parent)
   * - path = parent.path + "/" + slug (nếu có parent), ngược lại = slug
   * - Không cho tạo level > 3
   * - Xử lý concurrent create: unique index + bắt duplicate key → 409
   */
  async createCategory(adminId: string, input: CreateCategoryInput) {
    const { name, parentId, description, sortOrder, isActive } = input;

    // 1. Tạo slug từ name
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let slugCounter = 1;

    // 2. Kiểm tra và xử lý duplicate slug (trước khi tạo)
    // Nếu slug đã tồn tại, thêm số vào cuối
    while (await categoryRepository.slugExists(slug)) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // 3. Xử lý parentId và tính level, path
    let parent = null;
    let level = 0;
    let path = slug;

    if (parentId) {
      // Kiểm tra parent tồn tại
      parent = await categoryRepository.findById(parentId);
      if (!parent) {
        const error = new Error("Parent category not found");
        (error as any).statusCode = 404;
        (error as any).code = CategoryErrorCodes.PARENT_NOT_FOUND;
        throw error;
      }

      // Kiểm tra parent isActive
      if (!parent.isActive) {
        const error = new Error("Parent category is not active");
        (error as any).statusCode = 422;
        (error as any).code = CategoryErrorCodes.PARENT_INACTIVE;
        throw error;
      }

      // Tính level
      level = parent.level + 1;

      // Kiểm tra level không vượt quá 3
      if (level > 3) {
        const error = new Error("Maximum category level (3) exceeded");
        (error as any).statusCode = 422;
        (error as any).code = CategoryErrorCodes.MAX_LEVEL_EXCEEDED;
        throw error;
      }

      // Tính path
      path = `${parent.path}/${slug}`;
    }

    // 4. Kiểm tra duplicate (name + parentId) - double check trước khi insert
    const existingByName = await categoryRepository.findByParentIdAndName(
      parentId ? (parentId as unknown as mongoose.Types.ObjectId) : null,
      name
    );
    if (existingByName) {
      const error = new Error("Category with this name already exists in the same parent");
      (error as any).statusCode = 409;
      (error as any).code = CategoryErrorCodes.DUPLICATE;
      (error as any).details = {
        fieldErrors: {
          name: "Tên danh mục đã tồn tại trong cùng danh mục cha"
        }
      };
      throw error;
    }

    // 5. Chuẩn bị data để tạo category
    const categoryData: any = {
      name: name.trim(),
      slug,
      parentId: parentId ? (parentId as unknown as mongoose.Types.ObjectId) : null,
      level,
      path,
      description: description?.trim() || undefined,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
      createdBy: adminId as unknown as mongoose.Types.ObjectId
    };

    try {
      // 6. Tạo category (unique index sẽ bắt duplicate nếu có race condition)
      const category = await categoryRepository.create(categoryData);

      // 7. Trả về category đã tạo
      return category;
    } catch (error: any) {
      // Xử lý duplicate key error từ MongoDB (race condition)
      if (error.code === 11000) {
        // Duplicate key error
        const duplicateField = Object.keys(error.keyPattern || {})[0];
        let message = "Category already exists";
        let fieldErrors: any = {};

        if (duplicateField === "slug") {
          message = "Slug already exists";
          fieldErrors.slug = "Slug đã tồn tại";
        } else if (duplicateField === "parentId" || duplicateField === "name") {
          message = "Category with this name already exists in the same parent";
          fieldErrors.name = "Tên danh mục đã tồn tại trong cùng danh mục cha";
        }

        const duplicateError = new Error(message);
        (duplicateError as any).statusCode = 409;
        (duplicateError as any).code = CategoryErrorCodes.DUPLICATE;
        (duplicateError as any).details = { fieldErrors };
        throw duplicateError;
      }

      // Re-throw các lỗi khác
      throw error;
    }
  },

  /**
   * Lấy danh sách categories (cho admin)
   */
  async getCategories(filters?: { isActive?: boolean; parentId?: string | null }) {
    const queryFilters: any = {};
    if (filters?.isActive !== undefined) {
      queryFilters.isActive = filters.isActive;
    }
    if (filters?.parentId !== undefined) {
      queryFilters.parentId = filters.parentId || null;
    }
    return categoryRepository.findAll(queryFilters);
  }
};

