import mongoose from "mongoose";
import weaviate from "weaviate-ts-client";
import { config } from "@/config";
import { updateAllClasses } from "@/services/schema";
import { log } from "@/utils/log";

const weaviateClient = weaviate.client({
  scheme: "http",
  host: config.weaviateUri,
});

const connectMongoose = async () => {
  try {
    await mongoose.connect(config.mongoUri, config.mongoOptions);
    log.info("Connected to MongoDB");
  } catch (error) {
    log.error("Failed to connect to MongoDB:", error as Error);
  }
};

export default {
  setupMongoDB: connectMongoose,
  weaviateClient: weaviateClient || null,
  updateAllClasses,
};
