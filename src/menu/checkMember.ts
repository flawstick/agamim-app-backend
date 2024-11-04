import RestaurantModel from "@/models/restaurant";
import mongoose from "mongoose";

// *
// check if the user is a member of the restaurant that owns the menu
// @param restaurantId - the id of the restaurant
// @param userId - the id of the user
// *
export const checkMember = async (
  restaurantId: string,
  userId: string,
): Promise<boolean> => {
  let restaurant: any;
  try {
    let restaurantIdParsed = new mongoose.Types.ObjectId(restaurantId);
    restaurant = await RestaurantModel.findOne({
      _id: restaurantIdParsed,
      members: { $in: userId },
    });
  } catch (error) {
    throw new Error("Failed to find restaurant");
  }

  return !!restaurant;
};
