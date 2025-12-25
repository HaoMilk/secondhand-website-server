import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

import { app } from "./app.js"
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  console.log("🔍 Environment check:", {
    PORT: env.PORT,
    MONGO_URI: env.MONGO_URI ? "✅ Set" : "❌ Missing",
    JWT_SECRET: env.JWT_SECRET ? "✅ Set" : "❌ Missing"
  });
  
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
});
