import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { v1Router } from "./routes/index.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1", v1Router);

app.use(errorHandler);
