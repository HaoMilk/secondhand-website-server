import type { Response } from "express";
import { profileService, ProfileErrorCodes } from "../services/profile.service.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

/**
 * Profile Controller - Xử lý HTTP request/response cho Profile
 */
export const profileController = {
  /**
   * GET /api/v1/profile
   * Lấy thông tin profile của user hiện tại
   */
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const data = await profileService.getProfile(userId);
      return res.status(200).json(data);
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
   * PUT /api/v1/profile/basic-info
   * Cập nhật thông tin cá nhân cơ bản
   */
  async updateBasicInfo(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const profile = await profileService.updateBasicInfo(userId, req.body);
      return res.status(200).json(profile);
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
   * POST /api/v1/profile/shipping-addresses
   * Thêm địa chỉ giao hàng
   */
  async addShippingAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const address = await profileService.addShippingAddress(userId, req.body);
      return res.status(201).json(address);
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
   * PUT /api/v1/profile/shipping-addresses/:addressId
   * Cập nhật địa chỉ giao hàng
   */
  async updateShippingAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const addressId = req.params.addressId;
      const address = await profileService.updateShippingAddress(
        userId,
        addressId,
        req.body
      );
      return res.status(200).json(address);
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
   * DELETE /api/v1/profile/shipping-addresses/:addressId
   * Xóa địa chỉ giao hàng
   */
  async deleteShippingAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const addressId = req.params.addressId;
      await profileService.deleteShippingAddress(userId, addressId);
      return res.status(200).json({ success: true });
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
   * PUT /api/v1/profile/seller-info
   * Cập nhật thông tin người bán
   */
  async updateSellerInfo(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const sellerInfo = await profileService.updateSellerInfo(userId, req.body);
      return res.status(200).json(sellerInfo);
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
   * GET /api/v1/profile/check-sell
   * Kiểm tra có thể đăng bán không
   */
  async checkCanSell(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const result = await profileService.canSell(userId);
      return res.status(200).json(result);
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
   * GET /api/v1/profile/check-buy
   * Kiểm tra có thể mua hàng không
   */
  async checkCanBuy(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          code: "AUTH_REQUIRED",
          message: "Authentication required"
        });
      }

      const result = await profileService.canBuy(userId);
      return res.status(200).json(result);
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

