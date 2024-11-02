import RestaurantModel from "@/models/restaurant";

// *
// check if the user is a member of the restaurant that owns the menu
// @param restaurantId - the id of the restaurant
// @param userId - the id of the user
// *
export const checkMember = async (
  restaurantId: string,
  userId: string,
): Promise<boolean> => {
  const restaurant = await RestaurantModel.findOne({
    _id: restaurantId,
    members: { $in: userId },
  });

  return !!restaurant;
};
