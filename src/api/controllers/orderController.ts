import { Request, Response } from "express";
import OrderModel, { IOrder } from "@/models/order";
import RestaurantModel from "@/models/restaurant";
import CompanyModel from "@/models/company";
import UserModel from "@/models/user";
import { log } from "@/utils/log";
import mongoose from "mongoose";

export async function getRestaurantOrders(req: Request, res: Response) {
  const { restaurantId } = req.params;
  const { userId } = req.body?.user || {};

  if (!restaurantId) {
    log.warn(`Restaurant ID is required, received ${restaurantId}`);
    return res.status(400).json({ message: "Restaurant ID is required" });
  }
  if (!userId) {
    log.warn(`User ID is required, received ${userId}`);
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Find the restaurant and validate that the user is a member
    const restaurant = await RestaurantModel.findOne({
      _id: restaurantId,
      members: { $elemMatch: { $eq: userId } },
    });

    if (!restaurant) {
      log.warn(
        `Restaurant with ID ${restaurantId} not found or user ${req.body.firstName} not a member`,
      );
      return res
        .status(404)
        .json({ message: "Account does not manage this restaurant" });
    }

    // Find all orders related to the restaurantId
    const orders = await OrderModel.find({
      restaurantId: restaurantId,
    });

    if (orders.length === 0) {
      return res.status(204).json({ message: "No Orders." });
    }

    const filteredOrders = await Promise.all(
      orders.map(async (order) => {
        // Fetch the user who placed the order
        const user = await UserModel.findOne({ _id: order.userId });
        const truncatedUser = {
          name: user?.firstName + " " + user?.lastName,
          profile: user?.profile,
        };

        return {
          _id: order._id,
          userId: order.userId,
          user: truncatedUser,
          items: order.items, // Assuming items are part of the order model
          totalPrice: order.totalPrice,
          status: order.status,
          tenantId: order.tenantId,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          __v: order.__v,
        };
      }),
    );

    log.info(`Fetched all orders for restaurant ${restaurantId}`);
    res.status(200).json(filteredOrders);
  } catch (error) {
    log.error("Failed to get restaurant orders:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCompanyOrders(req: Request, res: Response) {
  const { companyId } = req.params;
  const { userId } = req.body?.user || {};

  if (!companyId) {
    return res.status(400).json({ message: "Company ID is required" });
  }
  if (!userId) {
    return res.status(400).json({ message: "Account ID is required" });
  }

  try {
    const company = await CompanyModel.findOne({
      _id: companyId,
      members: { $elemMatch: { $eq: userId } },
    });

    if (!company) {
      return res
        .status(404)
        .json({ message: "Account does not manage this company" });
    }

    const orders: IOrder[] = await OrderModel.find({
      tenantId: company.tenantId,
    });

    if (orders.length === 0) {
      return res.status(204).json({ message: "No Orders." });
    }

    const filteredOrders = await Promise.all(
      orders.map(async (order) => {
        // Fetch the restaurant associated with the restaurantId
        const fullRestaurant = await RestaurantModel.findOne({
          _id: order.restaurantId,
        });
        const truncatedRestaurant = {
          name: fullRestaurant?.name,
          location: fullRestaurant?.location,
          address: fullRestaurant?.address,
          profile: fullRestaurant?.profile,
        };

        // Fetch the user information associated with the order
        const user = await UserModel.findOne({ _id: order.userId });
        const truncatedUser = {
          name: user?.firstName + " " + user?.lastName,
          profile: user?.profile,
        };

        return {
          _id: order._id,
          userId: order.userId,
          user: truncatedUser,
          restaurant: truncatedRestaurant,
          items: order.items, // Assuming 'items' are still part of the order model
          totalPrice: order.totalPrice,
          status: order.status,
          tenantId: order.tenantId,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          __v: order.__v,
        };
      }),
    );

    res.status(200).json(filteredOrders);
  } catch (error) {
    log.error("Failed to get company orders:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get orders that belong to a specific user Id
export async function getUserOrders(req: Request, res: Response) {
  const { userId } = req.body?.user || {};

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await UserModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orders: IOrder[] = await OrderModel.find({ userId: userId });

    if (orders.length === 0) {
      return res.status(204).json({ message: "No Orders." });
    }

    log.info(`Fetched all orders for user ${user.firstName}`);
    res.status(200).json(orders);
  } catch (error) {
    log.error("Failed to get user orders:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}
