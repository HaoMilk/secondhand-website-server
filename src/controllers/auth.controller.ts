import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import type { UserRole } from "../models/user.model.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, role } = req.body;
    // Chỉ admin mới có thể tạo tài khoản với role khác user
    // Mặc định là user nếu không có role
    const userRole: UserRole = role || "user";
    const data = await authService.register(email, password, userRole);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
