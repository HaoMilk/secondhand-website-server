import { CategoryModel, type ICategory } from "../models/category.model.js";
import type mongoose from "mongoose";

export const categoryRepository = {
  /**
   * Tạo category mới
   */
  async create(data: Omit<ICategory, "createdAt" | "updatedAt">) {
    return CategoryModel.create(data);
  },

  /**
   * Tìm category theo ID
   */
  async findById(id: string | mongoose.Types.ObjectId) {
    return CategoryModel.findById(id);
  },

  /**
   * Tìm category theo slug
   */
  async findBySlug(slug: string) {
    return CategoryModel.findOne({ slug: slug.toLowerCase() });
  },

  /**
   * Tìm category theo parentId và name (để check duplicate)
   */
  async findByParentIdAndName(parentId: mongoose.Types.ObjectId | null, name: string) {
    return CategoryModel.findOne({ 
      parentId: parentId || null, 
      name: name.trim() 
    });
  },

  /**
   * Lấy danh sách categories (có thể filter theo isActive)
   */
  async findAll(filters?: { isActive?: boolean; parentId?: mongoose.Types.ObjectId | null }) {
    const query: any = {};
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.parentId !== undefined) {
      query.parentId = filters.parentId || null;
    }
    return CategoryModel.find(query).sort({ sortOrder: 1, createdAt: 1 });
  },

  /**
   * Lấy danh sách categories theo parentId
   */
  async findByParentId(parentId: mongoose.Types.ObjectId | null) {
    return CategoryModel.find({ parentId: parentId || null, isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 });
  },

  /**
   * Kiểm tra slug đã tồn tại chưa
   */
  async slugExists(slug: string, excludeId?: string) {
    const query: any = { slug: slug.toLowerCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return CategoryModel.exists(query);
  }
};


