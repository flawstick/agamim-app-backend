import MenuModel, { ModifierModel } from "@/models/menu";
import RestaurantModel from "@/models/restaurant";
import { log } from "@/utils/log";

// *
// * Fetches the menu items and categories for a restaurantId
// * only good for DOS, and shorterning files. EXTRA WORK.
// * @param restaurantId - the id of the restaurantId
// * @returns the categories and items for the restaurant
// *
export async function getMenuItemsAndCategories(
  restaurantId: string,
): Promise<{ categories: string[] | undefined; items: any[] | undefined }> {
  const restaurant = await RestaurantModel.findOne({ _id: restaurantId })
    .select("menu")
    .lean();

  if (!restaurant || !restaurant.menu) {
    log.error("Restaurant or menu not found");
    return { categories: [], items: [] };
  }

  const menu = await MenuModel.findOne({ _id: restaurant.menu })
    .select("categories items")
    .lean();

  if (!menu) {
    return { categories: [], items: [] };
  }

  const { categories, items } = menu;
  return { categories, items };
}

// *
// * Fetches the modifiers for a restaurantId
// * @param restaurantId - the id of the restaurantId
// * @returns the modifiers for the restaurant
// *
export async function getModifiers(restaurantId: string): Promise<any[]> {
  try {
    return await ModifierModel.find({ restaurantId });
  } catch (error) {
    throw new Error("Failed to find menu");
  }
}
