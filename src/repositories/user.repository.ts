import { UserModel } from "../models/user.model.js";
import type { UserRole } from "../models/user.model.js";

export const userRepository = {
  findByEmail(email: string) {
    return UserModel.findOne({ email });
  },
  findById(id: string) {
    return UserModel.findById(id);
  },
  create(data: { email: string; passwordHash: string; role?: UserRole }) {
    return UserModel.create(data);
  }
};
