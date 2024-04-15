import mongoose from "mongoose";
import weaviate from "weaviate-ts-client";
import { config } from "@/config";
import { updateAllClasses } from "@/services/schema";

const weaviateClient = weaviate.client({
  scheme: "http",
  host: config.weaviateUri,
});

const connectMongoose = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
};

export default {
  setupMongoDB: connectMongoose,
  weaviateClient: weaviateClient || null,
  updateAllClasses,
};
