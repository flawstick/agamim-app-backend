import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "jwt-secret-key",
  mongoUri:
    `mongodb://${process.env.MONGODB_ADMIN_USERNAME}:${process.env.MONGODB_ADMIN_PASSWORD}@${process.env.MONGODB_URI}` ||
    "mongodb://localhost:27017/weaviate",
  mongoOptions: { dbName: process.env.MONGODB_DB_NAME || "weaviate" },
  weaviateUri: process.env.WEAVIATE_URI || "http://localhost:8080",
};
