import { ProductModel, type IProduct } from "../models/product.model.js";
import type mongoose from "mongoose";

export const productRepository = {
  /**
   * Tạo sản phẩm mới
   */
  async create(data: Omit<IProduct, "createdAt" | "updatedAt">) {
    return ProductModel.create(data);
  },

  /**
   * Tìm sản phẩm theo ID
   */
  async findById(id: string) {
    return ProductModel.findById(id).populate("sellerId", "email role");
  },

  /**
   * Tìm sản phẩm theo sellerId
   */
  async findBySellerId(sellerId: string) {
    return ProductModel.find({ sellerId });
  },

  /**
   * Tìm sản phẩm theo categoryId
   */
  async findByCategoryId(categoryId: string) {
    return ProductModel.find({ categoryId, status: "approved", isAvailable: true });
  },

  /**
   * Lấy tất cả sản phẩm đã được duyệt và có sẵn với phân trang
   */
  async findAllPaginated(page: number = 1, limit: number = 9) {
    const skip = (page - 1) * limit;
    const products = await ProductModel.find({ 
      status: "approved", 
      isAvailable: true 
    })
      .populate("sellerId", "email")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ProductModel.countDocuments({ 
      status: "approved", 
      isAvailable: true 
    });
    
    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
};


