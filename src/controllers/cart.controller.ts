import type { Response } from "express";
import { cartService, CartErrorCodes } from "../services/cart.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

/**
 * Cart Controller - Xử lý HTTP request/response cho Cart
 */
export const cartController = {
  /**
   * GET /api/cart
   * Lấy giỏ hàng của user hiện tại
   * 
   * Auth: Bearer Token (USER role)
   */
  async getCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const cart = await cartService.getCart(userId);

      // Format response
      const formattedItems = cart.items.map((item: any) => ({
        productId: item.productId._id.toString(),
        quantity: item.quantity,
        product: {
          id: item.productId._id.toString(),
          title: item.productId.title,
          description: item.productId.description,
          price: item.productId.price,
          images: item.productId.images,
          condition: item.productId.condition,
          quantity: item.productId.quantity,
          sellerId: item.productId.sellerId?._id?.toString() || item.productId.sellerId?.toString(),
          sellerEmail: item.productId.sellerId?.email
        }
      }));

      return res.status(200).json({
        items: formattedItems,
        totalItems: formattedItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        totalPrice: formattedItems.reduce(
          (sum: number, item: any) => sum + item.product.price * item.quantity,
          0
        )
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
   * POST /api/cart/items
   * Thêm sản phẩm vào giỏ hàng
   * 
   * Auth: Bearer Token (USER role)
   * Body: { productId: string, quantity?: number }
   */
  async addItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({
          code: CartErrorCodes.VALIDATION_ERROR,
          message: "Product ID is required"
        });
      }

      const cart = await cartService.addItem(userId, productId, quantity);

      // Format response
      const formattedItems = cart.items.map((item: any) => ({
        productId: item.productId._id.toString(),
        quantity: item.quantity,
        product: {
          id: item.productId._id.toString(),
          title: item.productId.title,
          description: item.productId.description,
          price: item.productId.price,
          images: item.productId.images,
          condition: item.productId.condition,
          quantity: item.productId.quantity,
          sellerId: item.productId.sellerId?._id?.toString() || item.productId.sellerId?.toString(),
          sellerEmail: item.productId.sellerId?.email
        }
      }));

      return res.status(200).json({
        items: formattedItems,
        totalItems: formattedItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        totalPrice: formattedItems.reduce(
          (sum: number, item: any) => sum + item.product.price * item.quantity,
          0
        )
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
   * PUT /api/cart/items/:productId
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * 
   * Auth: Bearer Token (USER role)
   * Body: { quantity: number }
   */
  async updateItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      if (!productId) {
        return res.status(400).json({
          code: CartErrorCodes.VALIDATION_ERROR,
          message: "Product ID is required"
        });
      }

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          code: CartErrorCodes.VALIDATION_ERROR,
          message: "Quantity must be at least 1"
        });
      }

      const cart = await cartService.updateItem(userId, productId, quantity);

      // Format response
      const formattedItems = cart.items.map((item: any) => ({
        productId: item.productId._id.toString(),
        quantity: item.quantity,
        product: {
          id: item.productId._id.toString(),
          title: item.productId.title,
          description: item.productId.description,
          price: item.productId.price,
          images: item.productId.images,
          condition: item.productId.condition,
          quantity: item.productId.quantity,
          sellerId: item.productId.sellerId?._id?.toString() || item.productId.sellerId?.toString(),
          sellerEmail: item.productId.sellerId?.email
        }
      }));

      return res.status(200).json({
        items: formattedItems,
        totalItems: formattedItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        totalPrice: formattedItems.reduce(
          (sum: number, item: any) => sum + item.product.price * item.quantity,
          0
        )
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
   * DELETE /api/cart/items/:productId
   * Xóa sản phẩm khỏi giỏ hàng
   * 
   * Auth: Bearer Token (USER role)
   */
  async removeItem(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({
          code: CartErrorCodes.VALIDATION_ERROR,
          message: "Product ID is required"
        });
      }

      const cart = await cartService.removeItem(userId, productId);

      // Format response
      const formattedItems = cart.items.map((item: any) => ({
        productId: item.productId._id.toString(),
        quantity: item.quantity,
        product: {
          id: item.productId._id.toString(),
          title: item.productId.title,
          description: item.productId.description,
          price: item.productId.price,
          images: item.productId.images,
          condition: item.productId.condition,
          quantity: item.productId.quantity,
          sellerId: item.productId.sellerId?._id?.toString() || item.productId.sellerId?.toString(),
          sellerEmail: item.productId.sellerId?.email
        }
      }));

      return res.status(200).json({
        items: formattedItems,
        totalItems: formattedItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        totalPrice: formattedItems.reduce(
          (sum: number, item: any) => sum + item.product.price * item.quantity,
          0
        )
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
   * DELETE /api/cart
   * Xóa toàn bộ giỏ hàng
   * 
   * Auth: Bearer Token (USER role)
   */
  async clearCart(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const cart = await cartService.clearCart(userId);

      return res.status(200).json({
        items: [],
        totalItems: 0,
        totalPrice: 0
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

