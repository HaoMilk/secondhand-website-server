import { cartRepository } from "../repositories/cart.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import type mongoose from "mongoose";

/**
 * Error codes cho Cart module
 */
export const CartErrorCodes = {
  USER_NOT_FOUND: "CART_USER_NOT_FOUND",
  PRODUCT_NOT_FOUND: "CART_PRODUCT_NOT_FOUND",
  PRODUCT_UNAVAILABLE: "CART_PRODUCT_UNAVAILABLE",
  INSUFFICIENT_QUANTITY: "CART_INSUFFICIENT_QUANTITY",
  VALIDATION_ERROR: "CART_VALIDATION_ERROR"
} as const;

/**
 * Cart Service - Xử lý business logic cho giỏ hàng
 */
export const cartService = {
  /**
   * Lấy giỏ hàng của user
   */
  async getCart(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    let cart = await cartRepository.findByUserId(userId);
    
    // Nếu chưa có giỏ hàng, tạo mới
    if (!cart) {
      cart = await cartRepository.create({
        userId: userId as unknown as mongoose.Types.ObjectId,
        items: []
      });
    }

    // Lọc các sản phẩm không còn tồn tại hoặc không available
    const validItems = cart.items.filter((item: any) => {
      return item.productId && 
             item.productId.status === "approved" && 
             item.productId.isAvailable;
    });

    // Nếu có item không hợp lệ, cập nhật lại giỏ hàng
    if (validItems.length !== cart.items.length) {
      cart = await cartRepository.update(userId, validItems);
    }

    return cart;
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addItem(userId: string, productId: string, quantity: number = 1) {
    // Kiểm tra user
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    // Kiểm tra sản phẩm
    const product = await productRepository.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.PRODUCT_NOT_FOUND;
      throw error;
    }

    // Kiểm tra sản phẩm có available không
    if (product.status !== "approved" || !product.isAvailable) {
      const error = new Error("Product is not available");
      (error as any).statusCode = 400;
      (error as any).code = CartErrorCodes.PRODUCT_UNAVAILABLE;
      throw error;
    }

    // Kiểm tra số lượng
    if (quantity < 1) {
      const error = new Error("Quantity must be at least 1");
      (error as any).statusCode = 400;
      (error as any).code = CartErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    if (quantity > product.quantity) {
      const error = new Error("Insufficient product quantity");
      (error as any).statusCode = 400;
      (error as any).code = CartErrorCodes.INSUFFICIENT_QUANTITY;
      throw error;
    }

    // Lấy giỏ hàng hiện tại
    let cart = await cartRepository.findByUserId(userId);
    
    if (!cart) {
      cart = await cartRepository.create({
        userId: userId as unknown as mongoose.Types.ObjectId,
        items: []
      });
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId._id.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Cập nhật số lượng
      const newQuantity = (cart.items[existingItemIndex].quantity as number) + quantity;
      
      if (newQuantity > product.quantity) {
        const error = new Error("Insufficient product quantity");
        (error as any).statusCode = 400;
        (error as any).code = CartErrorCodes.INSUFFICIENT_QUANTITY;
        throw error;
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Thêm mới
      cart.items.push({
        productId: productId as unknown as mongoose.Types.ObjectId,
        quantity
      });
    }

    // Lưu giỏ hàng
    cart = await cartRepository.update(userId, cart.items);
    return cart;
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  async updateItem(userId: string, productId: string, quantity: number) {
    // Kiểm tra user
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    // Kiểm tra số lượng
    if (quantity < 1) {
      const error = new Error("Quantity must be at least 1");
      (error as any).statusCode = 400;
      (error as any).code = CartErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    // Lấy giỏ hàng
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) {
      const error = new Error("Cart not found");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    // Tìm item
    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId._id.toString() === productId
    );

    if (itemIndex < 0) {
      const error = new Error("Item not found in cart");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    // Kiểm tra sản phẩm
    const product = await productRepository.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.PRODUCT_NOT_FOUND;
      throw error;
    }

    if (quantity > product.quantity) {
      const error = new Error("Insufficient product quantity");
      (error as any).statusCode = 400;
      (error as any).code = CartErrorCodes.INSUFFICIENT_QUANTITY;
      throw error;
    }

    // Cập nhật số lượng
    cart.items[itemIndex].quantity = quantity;
    const updatedCart = await cartRepository.update(userId, cart.items);
    return updatedCart;
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  async removeItem(userId: string, productId: string) {
    // Kiểm tra user
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    // Xóa item
    const cart = await cartRepository.removeItem(userId, productId);
    
    if (!cart) {
      const error = new Error("Cart not found");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.VALIDATION_ERROR;
      throw error;
    }

    return cart;
  },

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      (error as any).code = CartErrorCodes.USER_NOT_FOUND;
      throw error;
    }

    const cart = await cartRepository.update(userId, []);
    return cart;
  }
};

