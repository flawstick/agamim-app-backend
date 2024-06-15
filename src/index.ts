import express from "express";
import cors from "cors";
import authRouter from "@/api/routes/authRoutes";
import feedRouter from "@/api/routes/feedRoutes";
import orderRouter from "@/api/routes/orderRoutes";
import restaurantRouter from "@/api/routes/restaurantRoutes";
import menuRouter from "@/api/routes/menuRoutes";
import accountRouter from "@/api/routes/accountRoutes";
import uploadRouter from "@/api/routes/uploadRoutes";
import { loggerMiddleware, verifyJsonWebToken } from "@/api/middleware";
import { initializeServices } from "@/services/startup";
import { config } from "@/config";
import { log } from "@/utils/log";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  }),
);

// Middleware
app.use(express.json());
app.use(loggerMiddleware);
app.use(verifyJsonWebToken);

// Routes
app.use("/auth", authRouter);
app.use("/feed", feedRouter);
app.use("/orders", orderRouter);
app.use("/restaurants", restaurantRouter);
app.use("/menu", menuRouter);
app.use("/accounts", accountRouter);
app.use("/upload", uploadRouter);

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
