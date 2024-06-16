import { Request, Response } from "express";
import mongoose from "mongoose";
import OrderModel from "@/models/order";
import MenuModel from "@/models/menu"; // Assuming you have a MenuModel to fetch menus
import { log } from "@/utils/log";

export async function createOrder(req: Request, res: Response) {
  const {
    userId,
    restaurantId,
    items,
  }: {
    userId: string;
    restaurantId: string;
    items: [{ item: mongoose.Types.ObjectId; quantity: number }];
  } = req.body;
  const { tenantId } = req.headers;

  if (!userId || !restaurantId || !items || items.length < 1) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    // Fetch menu to get the details of the items
    const menu = await MenuModel.findOne({ restaurantId }).lean();
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Extract item details from the menu
    const itemsData = items.map((orderItem) => {
      const menuItem = menu.items.find((menuItem: any) =>
        menuItem._id.equals(orderItem.item),
      );
      if (!menuItem) {
        throw new Error(`Menu item with ID ${orderItem.item} not found`);
      }
      return { ...menuItem, quantity: orderItem.quantity };
    });

    const totalPrice = itemsData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const newOrder = new OrderModel({
      userId: new mongoose.Types.ObjectId(userId),
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      items: itemsData.map((item) => ({
        item: item._id,
        quantity: item.quantity,
      })),
      totalPrice,
      status: "pending",
      tenantId,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error: any) {
    log.error("Failed to create order:", error as Error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
