import express from "express";
import logger from "@/api/middleware/logger";
import authRouter from "@/api/routes/auth";
import { initializeServices } from "@/services/startup";
import { config } from "@/config";

const app = express();

// Middleware
app.use(express.json());
app.use(logger);

// Routes
app.use("/auth", authRouter);

initializeServices()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  })
  .catch((error: any) => {
    console.error("Server failed to start due to initialization error:", error);
    process.exit(1);
  });
