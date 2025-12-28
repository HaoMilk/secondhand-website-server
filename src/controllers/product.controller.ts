import type { Response } from "express";
import { productService, ProductErrorCodes } from "../services/product.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { createProductSchema } from "../validators/product.validator.js";

/**
 * Product Controller - Xử lý HTTP request/response cho Product
 */
export const productController = {
  /**
   * POST /api/products
   * Tạo sản phẩm mới
   * 
   * Auth: Bearer Token (USER role)
   */
  async createProduct(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      // Validate request body
      const validationResult = createProductSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          code: ProductErrorCodes.VALIDATION_ERROR,
          message: "Validation failed",
          details: validationResult.error.errors
        });
      }

      // Tạo sản phẩm
      const product = await productService.createProduct(userId, validationResult.data);

      // Trả về response thành công
      return res.status(201).json({
        id: product._id,
        title: product.title,
        description: product.description,
        categoryId: product.categoryId,
        brand: product.brand,
        size: product.size,
        color: product.color,
        material: product.material,
        gender: product.gender,
        style: product.style,
        price: product.price,
        condition: product.condition,
        defects: product.defects,
        defectImages: product.defectImages,
        images: product.images,
        quantity: product.quantity,
        sellerId: product.sellerId,
        authenticity: product.authenticity,
        status: product.status,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      });
    } catch (error: any) {
      // Xử lý lỗi từ service
      const statusCode = error.statusCode || 500;
      const code = error.code || "SYSTEM_ERROR";
      const message = error.message || "Internal Server Error";
      const details = error.details || undefined;

      return res.status(statusCode).json({
        code,
        message,
        ...(details && { details })
      });
    }
  },

  /**
   * GET /api/products/my-products
   * Lấy danh sách sản phẩm của user hiện tại
   * 
   * Auth: Bearer Token (USER role)
   */
  async getMyProducts(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      // Lấy danh sách sản phẩm
      const products = await productService.getMyProducts(userId);

      // Format response
      const formattedProducts = products.map((product) => ({
        id: product._id,
        title: product.title,
        description: product.description,
        categoryId: product.categoryId,
        brand: product.brand,
        size: product.size,
        color: product.color,
        material: product.material,
        gender: product.gender,
        style: product.style,
        price: product.price,
        condition: product.condition,
        defects: product.defects,
        defectImages: product.defectImages,
        images: product.images,
        quantity: product.quantity,
        sellerId: product.sellerId,
        authenticity: product.authenticity,
        status: product.status,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));

      return res.status(200).json({
        products: formattedProducts,
        total: formattedProducts.length
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const code = error.code || "SYSTEM_ERROR";
      const message = error.message || "Internal Server Error";

      return res.status(statusCode).json({
        code,
        message
      });
    }
  },

  /**
   * GET /api/products
   * Lấy danh sách tất cả sản phẩm đã được duyệt với phân trang (public)
   * 
   * Query params:
   * - page: số trang (mặc định: 1)
   * - limit: số sản phẩm mỗi trang (mặc định: 9)
   */
  async getAllProducts(req: any, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;

      if (page < 1 || limit < 1) {
        return res.status(400).json({
          code: ProductErrorCodes.VALIDATION_ERROR,
          message: "Page and limit must be positive numbers"
        });
      }

      const result = await productService.getAllProducts(page, limit);

      // Format response
      const formattedProducts = result.products.map((product: any) => ({
        id: product._id,
        title: product.title,
        description: product.description,
        categoryId: product.categoryId?._id || product.categoryId,
        categoryName: product.categoryId?.name,
        brand: product.brand,
        size: product.size,
        color: product.color,
        material: product.material,
        gender: product.gender,
        style: product.style,
        price: product.price,
        condition: product.condition,
        defects: product.defects,
        defectImages: product.defectImages,
        images: product.images,
        quantity: product.quantity,
        sellerId: product.sellerId?._id || product.sellerId,
        sellerEmail: product.sellerId?.email,
        authenticity: product.authenticity,
        status: product.status,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));

      return res.status(200).json({
        products: formattedProducts,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const code = error.code || "SYSTEM_ERROR";
      const message = error.message || "Internal Server Error";

      return res.status(statusCode).json({
        code,
        message
      });
    }
  },

  /**
   * GET /api/products/:id
   * Lấy chi tiết sản phẩm theo ID (public)
   * Chỉ trả về sản phẩm đã được duyệt và có sẵn
   */
  async getProductById(req: any, res: Response) {
    try {
      const productId = req.params.id;

      if (!productId) {
        return res.status(400).json({
          code: ProductErrorCodes.VALIDATION_ERROR,
          message: "Product ID is required"
        });
      }

      const product = await productService.getProductById(productId);

      // Format response
      return res.status(200).json({
        id: product._id,
        title: product.title,
        description: product.description,
        categoryId: product.categoryId?._id || product.categoryId,
        categoryName: product.categoryId?.name,
        brand: product.brand,
        size: product.size,
        color: product.color,
        material: product.material,
        gender: product.gender,
        style: product.style,
        price: product.price,
        condition: product.condition,
        defects: product.defects,
        defectImages: product.defectImages,
        images: product.images,
        quantity: product.quantity,
        sellerId: product.sellerId?._id || product.sellerId,
        sellerEmail: product.sellerId?.email,
        authenticity: product.authenticity,
        status: product.status,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const code = error.code || "SYSTEM_ERROR";
      const message = error.message || "Internal Server Error";

      return res.status(statusCode).json({
        code,
        message
      });
    }
  }
};

