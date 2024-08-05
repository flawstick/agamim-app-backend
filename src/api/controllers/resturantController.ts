import { Request, Response } from "express";
import RestaurantModel from "@/models/restaurant";
import MenuModel from "@/models/menu";
import { log } from "@/utils/log";

export async function createRestaurant(req: Request, res: Response) {
  const { name, address, contactEmail, contactPhone, coordinates } = req.body;

  if (!name || !coordinates) {
    return res.status(400).json({ message: "Name and companyId are required" });
  }

  try {
    const newRestaurant = new RestaurantModel({
      name,
      address,
      contactEmail,
      contactPhone,
      coordinates,
      members: [req.body.user.userId],
    });

    await newRestaurant.save();
    log.info(`Created new restaurant ${newRestaurant._id}`);
    res.status(201).json(newRestaurant);
  } catch (error) {
    log.error("Failed to create restaurant:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getRestaurantData(req: Request, res: Response) {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  try {
    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
      log.warn(`Restaurant with ID ${restaurantId} not found`);
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menu = await MenuModel.findById(restaurant.menuId);
    log.info(`Fetched restaurant data for ${restaurantId}`);
    res.status(200).json({ restaurant, menu });
  } catch (error) {
    log.error("Failed to get restaurant data:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getRestaurantMenu(req: Request, res: Response) {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    log.warn(`Restaurant ID is required, received ${restaurantId}`);
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  try {
    const menu = await MenuModel.findOne({ restaurantId });
    if (!menu) return res.status(404).json({ message: "No Menu." });
    if (!menu.items) {
      MenuModel.updateOne({ restaurantId }, { items: [] });
      log.info(`No menu found for restaurant ${restaurantId}`);
      return res.status(200).json([]);
    }

    log.info(`Fetched menu for restaurant ${restaurantId}`);
    res.status(200).json(menu.items);
  } catch (error) {
    log.error("Failed to get restaurant menu:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createRestaurantMenu(req: Request, res: Response) {
  const { restaurantId } = req.body;

  if (!restaurantId) {
    log.warn(`Restaurant ID is required, received ${restaurantId}`);
    return res
      .status(400)
      .json({ message: "Restaurant ID and items are required" });
  }

  try {
    const menu = new MenuModel({ restaurantId, items: [] });
    await menu.save();
    log.info(`Created menu for restaurant ${restaurantId}`);
    res.status(201).json(menu);
  } catch (error) {
    log.error("Failed to create restaurant menu:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
