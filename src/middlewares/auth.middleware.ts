import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { userRepository } from "../repositories/user.repository.js";
import type { UserRole } from "../models/user.model.js";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        code: "AUTH_REQUIRED",
        message: "Authentication required"
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: UserRole };

    const user = await userRepository.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        code: "AUTH_INVALID_TOKEN",
        message: "Invalid token"
      });
    }

    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({
      code: "AUTH_INVALID_TOKEN",
      message: "Invalid or expired token"
    });
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(401).json({
        code: "AUTH_REQUIRED",
        message: "Authentication required"
      });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        code: "AUTH_FORBIDDEN",
        message: "Insufficient permissions"
      });
    }

    next();
  };
}

