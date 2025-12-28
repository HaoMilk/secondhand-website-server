import { Router } from "express";
import { authRouter } from "./auth.route.js";
import { productRouter } from "./product.route.js";
import { categoryRouter } from "./category.route.js";
import { profileRouter } from "./profile.route.js";
import { cartRouter } from "./cart.route.js";

export const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/products", productRouter);
v1Router.use("/categories", categoryRouter);
v1Router.use("/profile", profileRouter);
v1Router.use("/cart", cartRouter);

// Admin routes
const adminRouter = Router();
adminRouter.use("/categories", categoryRouter);
v1Router.use("/admin", adminRouter);
