import { Router } from "express";
import { profileController } from "../controllers/profile.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export const profileRouter = Router();

// Tất cả routes đều yêu cầu authentication
profileRouter.use(authenticate);

// Profile routes
profileRouter.get("/", profileController.getProfile);
profileRouter.put("/basic-info", profileController.updateBasicInfo);
profileRouter.put("/seller-info", profileController.updateSellerInfo);

// Shipping addresses routes
profileRouter.post("/shipping-addresses", profileController.addShippingAddress);
profileRouter.put("/shipping-addresses/:addressId", profileController.updateShippingAddress);
profileRouter.delete("/shipping-addresses/:addressId", profileController.deleteShippingAddress);

// Check permissions
profileRouter.get("/check-sell", profileController.checkCanSell);
profileRouter.get("/check-buy", profileController.checkCanBuy);

