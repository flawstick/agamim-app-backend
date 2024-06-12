import { Request, Response } from "express";
import mongoose from "mongoose";
import OrderModel from "@/models/order";
import { log } from "@/utils/log";

export async function createOrder(req: Request, res: Response) {
  const {
    userId,
    restaurantId,
    items,
  }: { userId: string; restaurantId: string; items: any[] } = req.body;
  const { tenantId } = req.headers;

  if (!userId || !restaurantId || !items || items.length === 0) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const newOrder = new OrderModel({
      userId: new mongoose.Types.ObjectId(userId),
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      items,
      totalPrice,
      status: "pending",
      tenantId,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    log.error("Failed to create order:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
