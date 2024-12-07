// This code retrieves all orders for a given restaurant and user with pagination (like getTabletOrders but no status filters),
// sanitizes them, and returns them in a standardized IOrder format suitable for console usage.

import { Types } from "mongoose";
import RestaurantModel from "@/models/restaurant";
import OrderModel from "@/models/order";
import CompanyModel from "@/models/company";
import UserModel from "@/models/user";
import {
  IOrder,
  IOption,
  IModifier,
  IOrderItem,
  OrderStatus,
} from "@/orders/interfaces";

// Pagination limit
const MAX_ORDERS_PER_REQUEST = 40;

/**
 * Gets all orders for a given restaurant and user with pagination (no status filter)
 * @param {Types.ObjectId} restaurantId - The ID of the restaurant
 * @param {Types.ObjectId} userId - The ID of the user
 * @param {number} page - The page number (defaults to 1)
 * @returns {Promise<IOrder[]>} - The orders for the restaurant
 */
export async function getConsoleOrders(
  restaurantId: Types.ObjectId,
  userId: Types.ObjectId,
  page: number = 1,
): Promise<IOrder[]> {
  try {
    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }

    const restaurant = await RestaurantModel.findOne({
      _id: restaurantId,
      members: { $elemMatch: { $eq: userId } },
    });

    if (!restaurant) {
      throw new Error(`Restaurant with ID ${restaurantId} not found`);
    }

    const startIndex = (page - 1) * MAX_ORDERS_PER_REQUEST;

    // Fetch orders for the given restaurant without status filters, paginated
    const orders = await OrderModel.find({ restaurantId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(MAX_ORDERS_PER_REQUEST);

    if (orders.length === 0) {
      return [];
    }

    const sanitizedOrders = await sanitizeOrders(orders);
    return sanitizedOrders;
  } catch (error) {
    throw new Error(`Failed to get restaurant orders: ${error}`);
  }
}

/**
 * Sanitizes the document orders to the IOrder interface
 * Fetches company information based on tenantId
 * @param {Document[]} orderDocuments - The array of order documents
 * @returns {Promise<IOrder[]>} - The sanitized orders
 */
async function sanitizeOrders(orderDocuments: any[]): Promise<IOrder[]> {
  return Promise.all(
    orderDocuments.map(async (orderDocument) => {
      // Map order items
      const items: IOrderItem[] = orderDocument.items.map((item: any) => {
        // Map item modifiers
        const modifiers: IModifier[] =
          item.modifiers?.map((modifier: any) => {
            const options: IOption[] =
              modifier.options?.map((option: any) => ({
                name: option.name,
                price: option.price,
                quantity: option.quantity,
                multiple: option.multiple,
              })) || [];

            return {
              name: modifier.name,
              required: modifier.required,
              multiple: modifier.multiple,
              max: modifier.max,
              options: options,
            };
          }) || [];

        return {
          name: item.name,
          price: item.price,
          description: item.description,
          quantity: item.quantity,
          category: item.category,
          modifiers: modifiers,
        };
      });

      // Get status
      const status: OrderStatus = orderDocument.status;

      // Get customerName from user
      let userId =
        typeof orderDocument.userId === "string"
          ? orderDocument.userId
          : orderDocument?.userId?.toString();
      const user = await UserModel.findById(userId);
      const customerName = user
        ? `${user.firstName} ${user.lastName}`
        : "Guest";
      let customerProfile = user?.profile || "";

      const messageToKitchen = orderDocument.messageToKitchen || "";

      // Additional fields from schema
      const tip = orderDocument.tip || 0;
      const discountedPrice = orderDocument.discountedPrice || 0;

      // Map statusUpdates if any
      const statusUpdates = (orderDocument.statusUpdates || []).map(
        (update: any) => ({
          index: update.index,
          timeSincePrevious: update.timeSincePrevious,
          oldStatus: update.oldStatus,
          newStatus: update.newStatus,
          timestamp: update.timestamp?.toISOString() || "",
        }),
      );

      // Get orderNumber
      const orderNumber = orderDocument._id.toString();

      // Get createdAt
      const createdAt = orderDocument.createdAt?.toISOString() || "";

      // Fetch company based on tenantId
      const tenantId = orderDocument.tenantId;
      let companyName = "";
      let address = "";
      let avatarUrl = "";

      if (tenantId) {
        const company = await CompanyModel.findOne({ tenantId });

        if (company) {
          companyName = company.name;
          address = company.address || "";
          avatarUrl = company.profile?.logo || "";
        }
      }

      return {
        items,
        status,
        customerName,
        orderNumber,
        createdAt,
        tenantId,
        companyName,
        companyProfile: { avatarUrl },
        userId,
        customerProfile,
        address,
        messageToKitchen,
        tip,
        discountedPrice,
        statusUpdates,
      } as IOrder;
    }),
  );
}
