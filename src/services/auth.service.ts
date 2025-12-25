import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository.js";
import { env } from "../config/env.js";

export const authService = {
  async register(email: string, password: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw Object.assign(new Error("Email already exists"), {
        statusCode: 409,
        code: "AUTH_EMAIL_EXISTS"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ email, passwordHash });

    return { id: user._id, email: user.email };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw Object.assign(new Error("Invalid credentials"), {
        statusCode: 401,
        code: "AUTH_INVALID_CREDENTIALS"
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw Object.assign(new Error("Invalid credentials"), {
        statusCode: 401,
        code: "AUTH_INVALID_CREDENTIALS"
      });
    }

    const token = jwt.sign({ sub: user._id }, env.JWT_SECRET, {
      expiresIn: "1h"
    });

    return { accessToken: token };
  }
};
