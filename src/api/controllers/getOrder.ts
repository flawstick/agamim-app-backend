import { Request, Response } from "express";
import OrderModel from "@/models/order";
import { log } from "@/utils/log";

export async function getOrder(req: Request, res: Response) {
  const { orderId } = req.params;
  const { tenantId } = req.headers;

  try {
    const order = await OrderModel.findOne({ _id: orderId, tenantId }).exec();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    log.error("Failed to get order:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
