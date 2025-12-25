import { UserModel } from "../models/user.model.js";

export const userRepository = {
  findByEmail(email: string) {
    return UserModel.findOne({ email });
  },
  create(data: { email: string; passwordHash: string }) {
    return UserModel.create(data);
  }
};
