import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const data = await authService.register(email, password);
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
