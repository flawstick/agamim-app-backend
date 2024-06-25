import { Request, Response } from "express";
import OrderModel from "@/models/order";
import RestaurantModel from "@/models/restaurant";
import { log } from "@/utils/log";

export async function getRestaurantOrders(req: Request, res: Response) {
  const { restaurantId } = req.params;
  const userEmail = req.body?.user?.email;

  if (!restaurantId)
    return res.status(400).json({ message: "Restaurant ID is required" });
  if (!userEmail)
    return res.status(400).json({ message: "User email is required" });

  try {
    const restaurant = await RestaurantModel.findOne({
      contactEmail: userEmail,
    });

    if (!restaurant)
      return res
        .status(404)
        .json({ message: "User email not found in any restaurant" });
    const orders = await OrderModel.find({
      "restaurants.restaurantId": restaurantId,
    });

    if (orders.length === 0)
      return res.status(204).json({ message: "No Orders." });

    res.status(200).json(orders);
  } catch (error) {
    log.error("Failed to get restaurant orders:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
