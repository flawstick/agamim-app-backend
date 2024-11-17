import mongoose, { Document } from "mongoose";
import OrderModel, { IOrderLean } from "@/models/order";
import MenuModel, { IMenuItem, IModifier, IAddition } from "@/models/menu";
import { ModifierModel } from "@/models/menu"; // Import ModifierModel

// *
// * Create a new order
// * @param userId - the ID of the user creating the order
// * @param tenantId - the tenant ID associated with the order
// * @param orderData - the order object to create
// * @returns the created order object
// *
export async function createOrder(
  userId: string,
  tenantId: string,
  orderData: any,
): Promise<any> {
  try {
    // Sanitize and assemble the order
    const sanitizedOrder = await sanitizeAndAssembleOrder(
      userId,
      tenantId,
      orderData,
    );

    // Create the order
    const newOrder = new OrderModel(sanitizedOrder);

    // Save the order
    await newOrder.save();

    return newOrder;
  } catch (error) {
    throw error;
  }
}

// *
// * Sanitizes and assembles the order object
// * @param userId - the ID of the user creating the order
// * @param tenantId - the tenant ID associated with the order
// * @param orderData - the raw order data from the user
// * @returns the sanitized and assembled order object
// *
async function sanitizeAndAssembleOrder(
  userId: string,
  tenantId: string,
  orderData: any,
): Promise<IOrderLean> {
  const sanitizedOrder: Partial<IOrderLean> = {};

  // Assign userId and tenantId
  sanitizedOrder.userId = sanitizeObjectId(userId, "userId");
  sanitizedOrder.tenantId = sanitizeString(tenantId, "tenantId");

  // Set default status
  sanitizedOrder.status = "pending";

  // Validate items
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new Error("Order must have at least one item");
  }

  sanitizedOrder.items = [];
  let totalPrice = 0;

  // Fetch and assemble items
  for (const itemData of orderData.items) {
    const sanitizedItem = await assembleOrderItem(itemData, tenantId);
    sanitizedOrder.items.push(sanitizedItem);

    // Calculate item total price
    const modifiersTotal = sanitizedItem.modifiers.reduce(
      (modSum: number, mod: any) =>
        modSum +
        mod.options.reduce((optSum: number, opt: any) => optSum + opt.price, 0),
      0,
    );
    const itemTotalPrice =
      (sanitizedItem.price + modifiersTotal) * sanitizedItem.quantity;
    totalPrice += itemTotalPrice;
  }

  sanitizedOrder.totalPrice = totalPrice;
  sanitizedOrder.discountedPrice = orderData.discountedPrice || null;

  // Assign restaurantId (assuming all items are from the same restaurant)
  if (sanitizedOrder.items.length > 0) {
    sanitizedOrder.restaurantId = sanitizedOrder.items[0].restaurantId;
  } else {
    throw new Error("Unable to determine restaurantId from items");
  }

  return sanitizedOrder as IOrderLean;
}

// Assemble individual order item
async function assembleOrderItem(
  itemData: any,
  tenantId: string,
): Promise<any> {
  // Validate item _id
  const itemId = sanitizeObjectId(itemData._id, "item._id");

  // Fetch the menu containing the item
  const menu = await MenuModel.findOne({
    "items._id": itemId,
    tenantId: tenantId,
  }).lean();

  if (!menu) {
    throw new Error(`Item with _id ${itemId} not found`);
  }

  // Find the specific item
  const menuItem = menu.items.find((item: any) =>
    item._id.equals(itemId),
  ) as IMenuItem;

  if (!menuItem) {
    throw new Error(`Item with _id ${itemId} not found in menu`);
  }

  // Sanitize quantity
  const quantity = sanitizeNumber(itemData.quantity, "item.quantity", {
    min: 1,
    integer: true,
  });

  const sanitizedItem: Partial<any> = {
    _id: menuItem._id,
    name: menuItem.name,
    price: menuItem.price,
    description: menuItem.description,
    imageUrl: menuItem.imageUrl,
    category: menuItem.category,
    restaurantId: menuItem.restaurantId,
    quantity: quantity,
    modifiers: [],
  };

  // Process modifiers
  if (itemData.modifiers && Array.isArray(itemData.modifiers)) {
    for (const modifierData of itemData.modifiers) {
      const sanitizedModifier = await assembleModifier(
        modifierData,
        menuItem,
        tenantId,
      );
      sanitizedItem.modifiers.push(sanitizedModifier);
    }
  }

  return sanitizedItem as any;
}

// Assemble modifier with selected options
async function assembleModifier(
  modifierData: any,
  menuItem: IMenuItem,
): Promise<IModifier> {
  // Validate modifier _id
  const modifierId = sanitizeObjectId(modifierData._id, "modifier._id");

  // Check if the modifier is associated with the menuItem
  if (
    !menuItem.modifiers ||
    !menuItem.modifiers.some(
      (id) => id.toString().trim() === modifierId.toString(),
    )
  ) {
    throw new Error(
      `Modifier with _id ${modifierId} is not associated with item ${menuItem.name}`,
    );
  }

  // Fetch modifier from database
  const modifier = await ModifierModel.findOne({
    _id: modifierId,
    restaurantId: menuItem.restaurantId,
  }).lean();

  if (!modifier) {
    throw new Error(`Modifier with _id ${modifierId} not found`);
  }

  const sanitizedModifier: Partial<any> = {
    _id: modifier._id,
    name: modifier.name,
    required: modifier.required,
    multiple: modifier.multiple,
    options: [],
  };

  // Validate selected options
  if (
    !modifierData.options ||
    !Array.isArray(modifierData.options) ||
    modifierData.options.length === 0
  ) {
    if (modifier.required) {
      throw new Error(
        `Modifier ${modifier.name} is required but no options were selected`,
      );
    }
  } else {
    for (const optionIdStr of modifierData.options) {
      const optionId = sanitizeObjectId(optionIdStr, "option._id");

      // Find the option within the modifier's options
      const option: any = modifier.options.find(
        (opt: any) => opt._id && opt._id.equals(optionId),
      );

      if (!option) {
        throw new Error(
          `Option with _id ${optionId} not found in modifier ${modifier.name}`,
        );
      }

      const sanitizedOption: Partial<any> = {
        _id: option._id,
        name: option.name,
        price: option.price,
      };

      sanitizedModifier.options.push(sanitizedOption as IAddition);
    }
  }

  return sanitizedModifier as IModifier;
}

// Utility functions for sanitization and validation
function sanitizeObjectId(
  value: any,
  fieldName: string,
): mongoose.Types.ObjectId {
  if (!value) {
    throw new Error(`Missing required field: ${fieldName}`);
  }
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ObjectId for field: ${fieldName}`);
  }
  return new mongoose.Types.ObjectId(value);
}

function sanitizeString(value: any, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid or missing string for field: ${fieldName}`);
  }
  return value.trim();
}

function sanitizeNumber(
  value: any,
  fieldName: string,
  options?: { min?: number; max?: number; integer?: boolean },
): number {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`Invalid number for field: ${fieldName}`);
  }
  if (options?.min !== undefined && value < options.min) {
    throw new Error(
      `Value for field ${fieldName} must be at least ${options.min}`,
    );
  }
  if (options?.max !== undefined && value > options.max) {
    throw new Error(
      `Value for field ${fieldName} must be at most ${options.max}`,
    );
  }
  if (options?.integer && !Number.isInteger(value)) {
    throw new Error(`Value for field ${fieldName} must be an integer`);
  }
  return value;
}
