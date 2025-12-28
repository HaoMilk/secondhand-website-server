import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "";

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Xóa các user cũ nếu có (optional)
    await UserModel.deleteMany({ email: { $in: ["admin@test.com", "user@test.com"] } });
    console.log("🧹 Cleaned up old test users");

    const users = [
      {
        email: "admin@test.com",
        passwordHash: await bcrypt.hash("admin123", 10),
        role: "admin" as const,
      },
      {
        email: "user@test.com",
        passwordHash: await bcrypt.hash("user123", 10),
        role: "user" as const,
      },
    ];

    const createdUsers = await UserModel.insertMany(users);
    console.log("✅ Created users:");
    createdUsers.forEach((user) => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    console.log("\n📝 Login credentials:");
    console.log("   Admin: admin@test.com / admin123");
    console.log("   User:  user@test.com / user123");

    await mongoose.disconnect();
    console.log("\n✅ Seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();


