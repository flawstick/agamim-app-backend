import { Request, Response } from "express";
import OrderModel from "@/models/order";
import { log } from "@/utils/log";

export async function updateOrderStatus(req: Request, res: Response) {
  const { orderId } = req.params;
  const { status } = req.body;
  const { tenantId } = req.headers;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const order = await OrderModel.findOneAndUpdate(
      { _id: orderId, tenantId },
      { status },
      { new: true },
    ).exec();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    log.error("Failed to update order status:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
