import mongoose from "mongoose";
import { config } from "@/config";
import { log } from "@/utils/log";

const connectMongoose = async () => {
  try {
    await mongoose.connect(config.mongoUri, config.mongoOptions);
    log.sysInfo("Connected to MongoDB");
  } catch (error) {
    log.error("Failed to connect to MongoDB:", error as Error);
  }
};

export default {
  setupMongoDB: connectMongoose,
};
