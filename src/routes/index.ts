import { Router } from "express";
import { authRouter } from "./auth.route.js";

export const v1Router = Router();

v1Router.use("/auth", authRouter);
