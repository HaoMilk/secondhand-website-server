import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const response: any = {
    success: false,
    code: err.code || "SYSTEM_ERROR",
    message: err.message || "Internal Server Error"
  };

  // Thêm details nếu có (cho validation errors)
  if (err.details) {
    response.details = err.details;
  }

  res.status(err.statusCode || 500).json(response);
}
