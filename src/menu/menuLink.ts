import RestaurantModel from "@/models/restaurant";
import { log } from "@/utils/log";
import mongoose from "mongoose";

// *
// * This is used as a service to make sure the
// * restaurant links to the menu no matter what
// * @param restaurantId - the id of the restaurantId
// * @param menuId - the id of the menuId
// * @returns void
// *
export async function linkMenuToRestaurant(
  restaurantId: string,
  menuId: string,
): Promise<void> {
  try {
    const restaurant = await RestaurantModel.findOne({ _id: restaurantId });
    if (!restaurant) throw new Error("Restaurant or menu not found");

    if (restaurant?.menu?.cast?.toString()  === menuId) return;
    restaurant.menu = new mongoose.Types.ObjectId(menuId) as any;
    await restaurant.save();
    log.info(`Linked menu ${menuId} to restaurant ${restaurantId}`);
  } catch (error) {
    log.error("Failed to link menu to restaurant", error as Error);
  }
}