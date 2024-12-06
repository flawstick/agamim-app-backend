import { Request, Response } from "express";
import RestaurantModel from "@/models/restaurant";
import MenuModel from "@/models/menu";
import { log } from "@/utils/log";
import mongoose from "mongoose";
import { getTabletOrders } from "@/orders/getTabletOrder";
import { getConsoleOrders } from "@/orders/getConsoleOrder";

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
  let userId: string | undefined;
  let restaurantId: string | undefined;

  try {
    restaurantId = req.params.restaurantId;
    userId = req.body?.user?.userId;
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    const restaurant = await RestaurantModel.findOne({
      _id: new mongoose.Types.ObjectId(restaurantId),
      members: userId,
    });
    if (!restaurant) {
      log.warn(`Restaurant with ID ${restaurantId} not found`);
      return res.status(404).json({ message: "Restaurant not found" });
    }

    log.info(`Fetched restaurant data for ${restaurantId}`);
    res.status(200).json({ restaurant });
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

export async function updateRestaurant(req: Request, res: Response) {
  let restaurantId: string | undefined;
  let userId: string | undefined;

  // Filter out undefined values in the object
  const filterUndefined = (obj: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined),
    );
  };
  try {
    restaurantId = req.params.restaurantId;
    userId = req.body?.user?.userId;

    const restaurant = await RestaurantModel.findOne({
      _id: new mongoose.Types.ObjectId(restaurantId), // cast
      members: userId,
    });

    if (!restaurant) {
      log.warn(`User ${userId} is not a member of restaurant ${restaurantId}`);
      return res.status(403).json({ message: "Forbidden" });
    }

    // Filter undefined fields from req.body and create the update object
    const updateFields = filterUndefined({
      name: req.body.name,
      address: req.body.address,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      coordinates: req.body.coordinates,
      configurableUrl: req.body.configurableUrl,
      "profile.banner": req.body.banner,
      operatingData: req.body.operatingData,
      cuisine: req.body.cuisine,
      categories: req.body.categories,
    });
    await RestaurantModel.updateOne(
      { _id: restaurantId },
      { $set: updateFields },
    );

    log.info(`Updated restaurant ${restaurantId}`);
    res.status(200).json({ message: "Updated restaurant" });
  } catch (error) {
    log.error("Failed to update restaurant:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getRestaurantOrdersForTablet(
  req: Request,
  res: Response,
) {
  let userId: string | undefined;
  let restaurantId: string | undefined;
  let page: number | undefined;

  try {
    restaurantId = req.params.restaurantId;
    userId = req.body?.user?.userId;
    page = req.query.page ? parseInt(req.query.page as string) : 1;

    let orders = await getTabletOrders(
      new mongoose.Types.ObjectId(restaurantId),
      new mongoose.Types.ObjectId(userId),
      page,
    );

    log.info(`Fetched orders for restaurant ${restaurantId}`);
    res.status(200).json(orders);
  } catch (error) {
    log.error("Failed to get restaurant orders:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getRestaurantOrdersForConsole(
  req: Request,
  res: Response,
) {
  let userId: string | undefined;
  let restaurantId: string | undefined;
  let page: number | undefined;

  try {
    restaurantId = req.params.restaurantId;
    userId = req.body?.user?.userId;
    page = req.query.page ? parseInt(req.query.page as string) : 1;

    let orders = await getConsoleOrders(
      new mongoose.Types.ObjectId(restaurantId),
      new mongoose.Types.ObjectId(userId),
      page,
    );

    log.info(`Fetched orders for restaurant ${restaurantId}`);
    res.status(200).json(orders);
  } catch (error) {
    log.error("Failed to get restaurant orders:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
