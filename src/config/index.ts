import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "jwt-secret-key",
  weaviateUri: process.env.WEAVIATE_URI || "http://localhost:8080",
};
