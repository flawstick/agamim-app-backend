// This is how fetching is done in company console.
// This is used in company.grub.co.il and no where else.
// Companies fetch based on pagination and tenantId.
import { Types } from "mongoose";
import OrderModel from "@/models/order";
import CompanyModel from "@/models/company";
import UserModel from "@/models/user";
import RestaurantModel from "@/models/restaurant";
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
 * Gets all orders for a given tenantId and user with pagination (no status filter).
 * Returns the sanitized orders and pagination metadata, including company and restaurant info.
 * @param {string} tenantId - The tenantId of the company
 * @param {Types.ObjectId} userId - The ID of the user
 * @param {number} page - The page number (defaults to 1)
 * @returns {Promise<{orders: IOrder[], totalCount: number, maxPages: number}>}
 * - The orders for the tenant and pagination info
 */
export async function getCompanyConsoleOrders(
  tenantId: string,
  userId: Types.ObjectId,
  page: number = 1,
): Promise<{ orders: IOrder[]; totalCount: number; maxPages: number }> {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const company = await CompanyModel.findOne({
      tenantId,
      members: { $elemMatch: { $eq: userId } },
    });

    if (!company) {
      throw new Error(
        `Company with tenantId ${tenantId} not found or user is not a member`,
      );
    }

    // Get total count of all orders (no status filter) by tenantId
    const totalCount = await OrderModel.countDocuments({ tenantId });

    // Calculate total pages
    const maxPages = Math.ceil(totalCount / MAX_ORDERS_PER_REQUEST);

    const startIndex = (page - 1) * MAX_ORDERS_PER_REQUEST;

    // Fetch orders for the given tenantId, paginated
    const orderDocuments = await OrderModel.find({ tenantId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(MAX_ORDERS_PER_REQUEST);

    if (orderDocuments.length === 0) {
      return { orders: [], totalCount, maxPages };
    }

    const orders = await sanitizeOrders(orderDocuments);
    return { orders, totalCount, maxPages };
  } catch (error) {
    throw new Error(`Failed to get orders by tenantId: ${error}`);
  }
}

/**
 * Sanitizes the document orders to the IOrder interface
 * Fetches company and restaurant information.
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

      if (tenantId) {
        const company = await CompanyModel.findOne({ tenantId });
        if (company) {
          companyName = company.name;
        }
      }

      // Fetch restaurant information
      let restaurantName = "";
      let restaurantProfile: {
        name?: string;
        picture?: string;
        banner?: string;
      } = {};
      let restaurantAddress = "";

      if (orderDocument.restaurantId) {
        const restaurant = await RestaurantModel.findById(
          orderDocument.restaurantId,
        );
        if (restaurant) {
          restaurantName = restaurant.name || "";
          restaurantProfile = restaurant.profile || {};
          restaurantAddress = restaurant.address || "";
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
        userId,
        customerProfile,
        messageToKitchen,
        tip,
        discountedPrice,
        totalPrice,
        statusUpdates,
        restaurantName,
        restaurantProfile,
        restaurantAddress,
      } as IOrder;
    }),
  );
}
