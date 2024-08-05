import { Request, Response } from "express";
import OrderModel from "@/models/order";
import RestaurantModel from "@/models/restaurant";
import { log } from "@/utils/log";
import CompanyModel from "@/models/company";

export async function updateOrderStatus(req: Request, res: Response) {
  const { orderId } = req.params;
  const { status } = req.body;
  const { userId } = req.body?.user || {};

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const restaurant = await RestaurantModel.findOne({
      members: { $elemMatch: { $eq: userId } },
    });

    const company = await CompanyModel.findOne({
      members: { $elemMatch: { $eq: userId } },
    });

    if (!restaurant && !company) {
      log.warn(
        `User ${userId} tried to update order status without permission!`,
      );
      return res
        .status(403)
        .json({ message: "Account does not manage this restaurant" });
    }

    const order = await OrderModel.findOneAndUpdate(
      { _id: orderId },
      { status },
      { new: true },
    ).exec();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    log.info(`Updated order ${orderId} status to ${status}`);
    res.status(200).json(order);
  } catch (error) {
    log.error("Failed to update order status:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
