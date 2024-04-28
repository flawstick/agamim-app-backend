import express from "express";
import { loggerMiddleware, verifyJsonWebToken } from "@/api/middleware";
import authRouter from "@/api/routes/auth";
import feedRouter from "@/api/routes/feedRoutes";
import { initializeServices } from "@/services/startup";
import { config } from "@/config";
import { log } from "./utils/log";

const app = express();

// Middleware
app.use(express.json());
app.use(loggerMiddleware);
app.use(verifyJsonWebToken);

// Routes
app.use("/auth", authRouter);
app.use("/feed", feedRouter);

initializeServices()
  .then(() => {
    app.listen(config.port, () => {
      log.info(`Server started on port ${config.port}`);
    });
  })
  .catch((error: any) => {
    log.error("Server failed to start due to initialization error:", error);
    process.exit(1);
  });
