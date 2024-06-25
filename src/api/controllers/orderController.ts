import { Request, Response } from "express";
import OrderModel from "@/models/order";
import RestaurantModel from "@/models/restaurant";
import { log } from "@/utils/log";

export async function getRestaurantOrders(req: Request, res: Response) {
  const { restaurantId } = req.params;
  const { userId } = req.body?.user || {};

  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const restaurant = await RestaurantModel.findOne({
      _id: restaurantId,
      members: { $elemMatch: { $eq: userId } },
    });

    if (!restaurant) {
      return res
        .status(404)
        .json({ message: "Account does not manage this restaurant" });
    }

    const orders = await OrderModel.find({
      "restaurants.restaurantId": restaurantId,
    });

    if (orders.length === 0) {
      return res.status(204).json({ message: "No Orders." });
    }

    res.status(200).json(orders);
  } catch (error) {
    log.error("Failed to get restaurant orders:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
