// Gets the orders for the tablet app for the restaurants
// it gets the orders in order of time and date, returns in chunks
// of MAX_ORDERS_PER_REQUEST times.

import { Types } from "mongoose";
import RestaurantModel from "@/models/restaurant";
import OrderModel from "@/models/order";
import CompanyModel from "@/models/company";
import {
  IOrder,
  IOption,
  IModifier,
  IOrderItem,
  OrderStatus,
} from "@/orders/interfaces";

// Pagination limit
const MAX_ORDERS_PER_REQUEST = 40;

/*
 * Gets the orders for the tablet app for the restaurants
 * it gets it based on the page number, pagination is done
 * in chunks of MAX_ORDERS_PER_REQUEST times.
 * @param {Types.ObjectId} restaurantId - The ID of the restaurant
 * @param {Types.ObjectId} userId - The ID of the user
 * @param {number} page - The page number
 * @returns {Promise<IOrder[]>} - The orders for the restaurant
 */
export async function getTabletOrders(
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

    const orders = await OrderModel.find({
      restaurantId,
      status: { $ne: "finished" },
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(MAX_ORDERS_PER_REQUEST)
      .populate({
        path: "userId",
        select: "firstName lastName",
      });

    if (orders.length === 0) {
      return [];
    }

    // Call sanitizeOrders, which now handles fetching the company
    const sanitizedOrders = await sanitizeOrders(orders);

    return sanitizedOrders;
  } catch (error) {
    throw new Error(`Failed to get restaurant data: ${error}`);
  }
}

/*
 * Sanitizes the document orders to the IOrder interface
 * Fetches company information based on tenantId within the function
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
      const user = orderDocument.userId;
      const customerName = user
        ? `${user.firstName} ${user.lastName}`
        : "Guest";

      // Get orderNumber
      const orderNumber = orderDocument._id.toString();

      // Get createdAt
      const createdAt = orderDocument.createdAt?.toISOString() || "";

      // Fetch company based on tenantId
      const tenantId = orderDocument.tenantId;
      let companyName = "";
      let address = "";

      if (tenantId) {
        const company = await CompanyModel.findOne({ tenantId });

        if (company) {
          companyName = company.name;
          address = company.address || "";
        }
      }

      return {
        items,
        status,
        customerName,
        orderNumber,
        createdAt,
        companyName,
        address,
      } as IOrder;
    }),
  );
}
