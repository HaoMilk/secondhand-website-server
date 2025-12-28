import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

export const productRouter = Router();

/**
 * POST /api/products
 * Tạo sản phẩm mới
 * 
 * Requirements:
 * - Authentication: Bearer Token
 * - Authorization: USER role
 */
productRouter.post(
  "/",
  authenticate,
  authorize("user"),
  productController.createProduct.bind(productController)
);

/**
 * GET /api/products
 * Lấy danh sách tất cả sản phẩm đã được duyệt với phân trang (public)
 * 
 * Query params:
 * - page: số trang (mặc định: 1)
 * - limit: số sản phẩm mỗi trang (mặc định: 9)
 */
productRouter.get(
  "/",
  productController.getAllProducts.bind(productController)
);

/**
 * GET /api/products/:id
 * Lấy chi tiết sản phẩm theo ID (public)
 * Chỉ trả về sản phẩm đã được duyệt và có sẵn
 */
productRouter.get(
  "/:id",
  productController.getProductById.bind(productController)
);

/**
 * GET /api/products/my-products
 * Lấy danh sách sản phẩm của user hiện tại
 * 
 * Requirements:
 * - Authentication: Bearer Token
 * - Authorization: USER role
 */
productRouter.get(
  "/my-products",
  authenticate,
  authorize("user"),
  productController.getMyProducts.bind(productController)
);

