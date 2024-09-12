import mongoose from "mongoose";
import { config } from "@/config";
import { log } from "@/utils/log";

const connectMongoose = async () => {
  try {
    const connection = await mongoose.connect(
      config.mongoUri,
      config.mongoOptions,
    );
    const db = mongoose.connection.db;
    db.restaurants.updateMany(
      {
        "coordinates.lat": { $exists: true },
        "coordinates.lng": { $exists: true },
      }, // Match documents with lat and lng fields
      [
        {
          $set: {
            coordinates: {
              type: "Point",
              coordinates: ["$coordinates.lng", "$coordinates.lat"], // Convert to GeoJSON format
            },
          },
        },
      ],
    );

    log.sysInfo("Connected to MongoDB");
  } catch (error) {
    log.error("Failed to connect to MongoDB:", error as Error);
  }
};

export default {
  setupMongoDB: connectMongoose,
};
