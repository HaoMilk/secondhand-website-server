import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(err.statusCode || 500).json({
    code: err.code || "SYSTEM_ERROR",
    message: err.message || "Internal Server Error"
  });
}
