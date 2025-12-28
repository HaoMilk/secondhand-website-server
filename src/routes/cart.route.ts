import { Router } from "express";
import { cartController } from "../controllers/cart.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

export const cartRouter = Router();

/**
 * GET /api/cart
 * Lấy giỏ hàng của user hiện tại
 * 
 * Requirements:
 * - Authentication: Bearer Token
 * - Authorization: USER role
 */
cartRouter.get(
  "/",
  authenticate,
  authorize("user"),
  cartController.getCart.bind(cartController)
);

/**
 * POST /api/cart/items
 * Thêm sản phẩm vào giỏ hàng
 * 
 * Requirements:
 * - Authentication: Bearer Token
 * - Authorization: USER role
 * Body: { productId: string, quantity?: number }
 */
cartRouter.post(
  "/items",
  authenticate,
  authorize("user"),
  cartController.addItem.bind(cartController)
);

/**
 * PUT /api/cart/items/:productId
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * 
 * Requirements:
 * - Authentication: Bearer Token
 * - Authorization: USER role
 * Body: { quantity: number }
 */
cartRouter.put(
  "/items/:productId",
  authenticate,
  authorize("user"),
  cartController.updateItem.bind(cartController)
);

/**
 * DELETE /api/cart/items/:productId
 * Xóa sản phẩm khỏi giỏ hàng
 * 
 * Requirements:
 * - Authentication: Bearer Token
 * - Authorization: USER role
 */
cartRouter.delete(
  "/items/:productId",
  authenticate,
  authorize("user"),
  cartController.removeItem.bind(cartController)
);

/**
 * DELETE /api/cart
 * Xóa toàn bộ giỏ hàng
 * 
 * Requirements:
 * - Authentication: Bearer Token
 * - Authorization: USER role
 */
cartRouter.delete(
  "/",
  authenticate,
  authorize("user"),
  cartController.clearCart.bind(cartController)
);

