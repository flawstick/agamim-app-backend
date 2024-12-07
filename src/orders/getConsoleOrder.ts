// This code retrieves all orders for a given restaurant and user with pagination (like getTabletOrders but no status filters),
// sanitizes them, and returns them along with pagination metadata.
// This way, you know how many pages exist and can handle dynamic loading on the client side.

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
 * Gets all orders for a given restaurant and user with pagination (no status filter).
 * Returns the sanitized orders and pagination metadata.
 * @param {Types.ObjectId} restaurantId - The ID of the restaurant
 * @param {Types.ObjectId} userId - The ID of the user
 * @param {number} page - The page number (defaults to 1)
 * @returns {Promise<{orders: IOrder[], totalCount: number, maxPages: number}>}
 * - The orders for the restaurant and pagination info
 */
export async function getConsoleOrders(
  restaurantId: Types.ObjectId,
  userId: Types.ObjectId,
  page: number = 1,
): Promise<{ orders: IOrder[]; totalCount: number; maxPages: number }> {
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

    // Get total count of all orders (no status filter)
    const totalCount = await OrderModel.countDocuments({ restaurantId });

    // Calculate total pages
    const maxPages = Math.ceil(totalCount / MAX_ORDERS_PER_REQUEST);

    const startIndex = (page - 1) * MAX_ORDERS_PER_REQUEST;

    // Fetch orders for the given restaurant, paginated
    const orderDocuments = await OrderModel.find({ restaurantId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(MAX_ORDERS_PER_REQUEST);

    if (orderDocuments.length === 0) {
      return { orders: [], totalCount, maxPages };
    }

    const orders = await sanitizeOrders(orderDocuments);
    return { orders, totalCount, maxPages };
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

      // Additional fields
      const tip = orderDocument.tip || 0;
      const discountedPrice = orderDocument.discountedPrice || 0;
      const totalPrice = orderDocument.totalPrice || 0;

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
        _id: orderDocument._id,
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
        totalPrice,
        statusUpdates,
      } as IOrder;
    }),
  );
}
