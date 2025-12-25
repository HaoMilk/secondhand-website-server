import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT ?? 4040),
  MONGO_URI: process.env.MONGO_URI ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev_secret"
};
