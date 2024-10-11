import cron from "node-cron";
import RestaurantModel, { IRestaurantLean } from "@/models/restaurant"; // Import your model
import dayjs from "dayjs"; // For handling dates and times
import { log } from "@/utils/log";

// Function to determine if the restaurant is open
const checkRestaurantStatus = (
  restaurant: IRestaurantLean,
): "open" | "closed" => {
  const today = dayjs().format("dddd").toLowerCase(); // Get current day (e.g., "monday")
  const currentTime = dayjs().format("HH:mm"); // Get current time in 24-hour format

  const operatingHours = restaurant.operatingData?.[
    today as keyof typeof restaurant.operatingData
  ] as {
    open: string;
    close: string;
  };
  if (!operatingHours) return "closed"; // No hours set, default to closed

  // Compare current time with restaurant open/close times
  const isOpen =
    currentTime >= operatingHours.open && currentTime <= operatingHours.close;
  return isOpen ? "open" : "closed";
};

// Service to update restaurant statuses
const updateRestaurantStatuses = async () => {
  try {
    const restaurants = await RestaurantModel.find(); // Fetch all restaurants

    // Check each restaurant's open/closed status and update if necessary
    for (const restaurant of restaurants) {
      const newStatus = checkRestaurantStatus(restaurant);
      if (restaurant.operatingData?.status !== newStatus) {
        if (!restaurant.operatingData) return;
        restaurant.operatingData.status = newStatus;
        await restaurant.save(); // Save changes to the database
        log.info(`Updated ${restaurant.name} status to ${newStatus}`);
      }
    }
  } catch (error) {
    log.error("Failed to update restaurant statuses:", error as Error);
  }
};

export async function startOperatingCron() {
  cron.schedule("*/30 * * * *", updateRestaurantStatuses);
  log.sysInfo("Restaurant status check service is running every 30 minutes.");
}
