// File to handle payroll for now;
// TODO: will be imporved and sanitized further,
// more metadata will be added for convenience of the user,
// more security will be implemented for the user
import { Types } from "mongoose";
import OrderModel, { IOrderLean } from "@/models/order";
import UserModel from "@/models/user";

/**
 * Represents the structure of the payroll entry for each user.
 */
interface PayrollEntry {
  totalValue: number;
  orderCount: number;
  username: string;
  orders: {
    orderId: string;
    totalPrice: number;
    discountedPrice?: number;
    createdAt: Date;
  }[];
}

/**
 * Retrieves payroll details for orders grouped by user ID based on a specific tenant and date range.
 * @param {string | Types.ObjectId} tenantId - The ID of the tenant (company).
 * @param {Date} startDate - The start date for the payroll period.
 * @param {Date} endDate - The end date for the payroll period.
 * @returns {Promise<Record<string, PayrollEntry>>} - A hashmap containing user IDs and payroll details.
 */
export async function getPayrollByDate(
  tenantId: string | Types.ObjectId,
  startDate: Date,
  endDate: Date,
): Promise<Record<string, PayrollEntry>> {
  try {
    // Sanitize tenantId to a string
    if (!tenantId) {
      throw new Error("Tenant ID is required.");
    }
    const tenantIdStr =
      tenantId instanceof Types.ObjectId ? tenantId.toString() : tenantId;

    // Sanitize date range
    startDate = startDate || new Date("1970-01-01");
    endDate = endDate || new Date();

    // Fetch orders based on tenantId and date range
    const orders: (IOrderLean & { userId: Types.ObjectId })[] =
      await OrderModel.find({
        tenantId: tenantIdStr,
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ["cancelled", "rejected", "pending"] },
      })
        .select("_id totalPrice discountedPrice createdAt userId")
        .lean();

    if (orders.length === 0) {
      return {};
    }

    // Group orders by userId and calculate totals
    const payrollMap: Record<string, PayrollEntry> = {};

    for (const order of orders) {
      const userId = order.userId.toString();

      if (!payrollMap[userId]) {
        // Initialize payroll entry for the user
        payrollMap[userId] = {
          totalValue: 0,
          orderCount: 0,
          username: "",
          orders: [],
        };
      }

      // Add sanitized order details
      payrollMap[userId].totalValue += order.totalPrice;
      payrollMap[userId].orderCount += 1;
      payrollMap[userId].orders.push({
        orderId: order._id.toString(),
        totalPrice: order.totalPrice,
        discountedPrice: order.discountedPrice,
        createdAt: order.createdAt as Date,
      });
    }

    // Fetch usernames for each userId
    const userIds = Object.keys(payrollMap).map((id) => new Types.ObjectId(id));
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select("_id firstName lastName")
      .lean();

    // Map usernames to payroll entries
    users.forEach((user) => {
      const userId = user._id.toString();
      if (payrollMap[userId]) {
        payrollMap[userId].username = `${user.firstName} ${user.lastName}`;
      }
    });

    // Default to "Unknown User" if no username was found
    for (const userId in payrollMap) {
      if (!payrollMap[userId].username) {
        payrollMap[userId].username = "Unknown User";
      }
    }

    return payrollMap;
  } catch (error: any) {
    throw new Error(`Failed to get payroll data: ${error.message}`);
  }
}
