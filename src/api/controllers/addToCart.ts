import { Request, Response } from "express";
import mongoose from "mongoose";
import OrderModel from "@/models/order";
import { log } from "@/utils/log";

export async function addToCart(req: Request, res: Response) {
  const {
    userId,
    itemId,
    quantity,
    price,
  }: { userId: string; itemId: string; quantity: number; price: number } =
    req.body;
  const { tenantId } = req.headers;

  if (!userId || !itemId || quantity <= 0 || price <= 0) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    let order = await OrderModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      status: "pending",
      tenantId,
    });

    if (order) {
      const existingItemIndex = order.items.findIndex(
        (item: any) => item.itemId.toString() === itemId,
      );
      if (existingItemIndex > -1) {
        order.items[existingItemIndex].quantity += quantity;
      } else {
        order.items.push({
          itemId: new mongoose.Types.ObjectId(itemId),
          quantity,
          price,
        });
      }
    } else {
      order = new OrderModel({
        userId: new mongoose.Types.ObjectId(userId),
        restaurantId: new mongoose.Types.ObjectId(req.body.restaurantId),
        items: [
          { itemId: new mongoose.Types.ObjectId(itemId), quantity, price },
        ],
        totalPrice: quantity * price,
        status: "pending",
        tenantId,
      });
    }

    await order.save();
    res.status(200).json(order);
  } catch (error) {
    log.error("Failed to add to cart:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
