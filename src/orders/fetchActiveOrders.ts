// fetchActiveOrders.ts
// Purpose: Fetch active orders from the database

import CompanyModel from "@/models/company";
import OrderModel from "@/models/order";
import UserModel from "@/models/user";
import { Types } from "mongoose";

/*
 * Fetches active orders from the database
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns {Promise<any>} - just a bunch of order promises
 * @throws {Error} - Throws an error if the request fails
 */
export async function fetchActiveOrders(
  userId: Types.ObjectId,
  tenantId: string,
): Promise<any> {
  const user = await UserModel.findOne({
    _id: userId,
    tenantId: tenantId,
  });
  if (!user) return { message: "User not found" };
  console.log("User found");
  console.log(userId);
  console.log(tenantId);

  const company = await CompanyModel.findOne({
    tenantId,
  });
  if (!company) return { message: "Company not found" };

  // find orders that have status "pending" or "confirmed"
  let orders = await OrderModel.find({
    userId,
    status: { $in: ["pending", "confirmed"] },
  });

  return orders || { message: "No Orders." };
}
