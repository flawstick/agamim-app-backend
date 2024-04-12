import express from "express";
import logger from "@/api/middleware/logger";
import authRouter from "@/api/routes/auth";
import { config } from "@/config";

const app = express();

// Middleware
app.use(express.json());
app.use(logger);

// Routes
app.use("/auth", authRouter);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
