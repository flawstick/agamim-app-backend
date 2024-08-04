import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || "jwt-secret-key",
  mongoUri: `mongodb+srv://${process.env.MONGODB_ADMIN_USERNAME}:${process.env.MONGODB_ADMIN_PASSWORD}@${process.env.MONGODB_URI}`,
  mongoOptions: { dbName: process.env.MONGODB_DB_NAME },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "cloud-name",
  api_key: process.env.CLOUDINARY_API_KEY || "cloudinary-api-key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "cloud-name",
});

export { cloudinary };
