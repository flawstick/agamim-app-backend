import db from "@/config/db";
import { log } from "@/utils/log";

/**
 * Initialize application services and handle any setup needed before the server starts.
 * @returns Promise<void>
 */
async function initializeServices(): Promise<void> {
  try {
    // Connect to MongoDB
    await db.setupMongoDB();

    log.info("All services initialized successfully.");
  } catch (error) {
    log.error("Failed to initialize services:", error as Error);
  }
}

export { initializeServices };
