import db from "@/config/db";
import { log } from "@/utils/log";
import { startOperatingCron } from "./operating-cron";

/**
 * Initialize application services and handle any setup needed before the server starts.
 * @returns Promise<void>
 */
async function initializeServices(): Promise<void> {
  try {
    log.sysInfo("Initializing services...");
    await db.setupMongoDB();
    await startOperatingCron();

    log.sysInfo("All services initialized successfully.");
  } catch (error) {
    log.error("Failed to initialize services:", error as Error);
  }
}

export { initializeServices };
