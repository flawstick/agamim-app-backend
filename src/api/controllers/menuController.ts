import { Request, Response } from "express";
import MenuModel, { IMenuItem } from "@/models/menu";
import { log } from "@/utils/log";

export async function getRestaurantMenu(req: Request, res: Response) {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  try {
    const menu = await MenuModel.findOne({ restaurantId });
    if (!menu) return res.status(204).json({ message: "No Menu." });
    if (!menu.items) {
      MenuModel.updateOne({ restaurantId }, { items: [] });
      return res.status(200).json([]);
    }

    res.status(200).json(menu.items);
  } catch (error) {
    log.error("Failed to get restaurant menu:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createRestaurantMenu(req: Request, res: Response) {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  try {
    const menu = new MenuModel({ restaurantId, items: [] });
    await menu.save();
    res.status(201).json(menu);
  } catch (error) {
    log.error("Failed to create restaurant menu:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateRestaurantMenu(req: Request, res: Response) {
  const { restaurantId } = req.params;
  const { items } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  if (!items) {
    return res.status(400).json({ message: "Items are required" });
  }

  try {
    const menu = await MenuModel.findOne({ restaurantId });
    if (!menu) return res.status(204).json({ message: "No Menu." });

    menu.items = items;
    menu.categories = items.map((item: IMenuItem) => item.category);
    await menu.save();
    res.status(200).json(menu);
  } catch (error) {
    log.error("Failed to update restaurant menu:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllMenuItems(req: Request, res: Response) {
  try {
    const menuItems = await MenuModel.find();
    const allItems = menuItems.map((menu) => menu.items).flat();
    res.status(200).json(allItems);
  } catch (error) {
    log.error("Failed to get all menu items:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
