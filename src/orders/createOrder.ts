import mongoose from "mongoose";
import OrderModel, { IOrderLean } from "@/models/order";
import MenuModel, { IMenuItem, IModifier, IAddition } from "@/models/menu";
import { ModifierModel } from "@/models/menu";

// *
// * Create a new order
// * @param userId - the ID of the user creating the order
// * @param tenantId - the tenant ID associated with the order
// * @param restaurantId - the ID of the restaurant
// * @param orderData - the order object to create
// * @returns the created order object
// *
export async function createOrder(
  userId: string,
  tenantId: string,
  restaurantId: string,
  orderData: any,
) {
  try {
    // Sanitize and assemble the order
    const sanitizedOrder = await sanitizeAndAssembleOrder(
      userId,
      tenantId,
      restaurantId,
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
// * @param restaurantId - the ID of the restaurant
// * @param orderData - the raw order data from the user
// * @returns the sanitized and assembled order object
// *
async function sanitizeAndAssembleOrder(
  userId: string,
  tenantId: string,
  restaurantId: string,
  orderData: any,
): Promise<IOrderLean> {
  const sanitizedOrder: Partial<IOrderLean> = {};

  // Assign userId, tenantId, and restaurantId
  sanitizedOrder.userId = sanitizeObjectId(userId, "userId") as any;
  sanitizedOrder.tenantId = sanitizeString(tenantId, "tenantId");
  sanitizedOrder.restaurantId = sanitizeObjectId(
    restaurantId,
    "restaurantId",
  ) as any;

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
    const sanitizedItem = await assembleOrderItem(
      itemData,
      tenantId,
      sanitizedOrder.restaurantId as any,
    );
    sanitizedOrder.items.push(sanitizedItem);

    // Calculate item total price
    const modifiersTotal = sanitizedItem.modifiers.reduce(
      (modSum: number, mod: any) =>
        modSum +
        mod.options.reduce(
          (optSum: number, opt: any) => optSum + opt.price * opt.quantity,
          0,
        ),
      0,
    );
    const itemTotalPrice =
      (sanitizedItem.price + modifiersTotal) * sanitizedItem.quantity;
    totalPrice += itemTotalPrice;
  }

  sanitizedOrder.totalPrice = totalPrice;
  sanitizedOrder.discountedPrice = orderData.discountedPrice || null;

  return sanitizedOrder as IOrderLean;
}

// Assemble individual order item
async function assembleOrderItem(
  itemData: any,
  tenantId: string,
  restaurantId: mongoose.Types.ObjectId,
): Promise<any> {
  // Validate item _id
  const itemId = sanitizeObjectId(itemData._id, "item._id");

  // Fetch the menu containing the item
  const menu = await MenuModel.findOne({
    restaurantId: restaurantId,
    tenantId: tenantId,
    "items._id": itemId,
  }).lean();

  if (!menu) {
    throw new Error(
      `Item with _id ${itemId} not found in the restaurant's menu`,
    );
  }

  // Find the specific item
  const menuItem = menu.items.find((item: any) =>
    item._id.equals(itemId),
  ) as IMenuItem;

  if (!menuItem) {
    throw new Error(`Item with _id ${itemId} not found in the menu`);
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
    category: menuItem.category?.toString(),
    restaurantId: menuItem.restaurantId,
    quantity: quantity,
    modifiers: [],
  };

  // Process modifiers
  if (itemData.modifiers && Array.isArray(itemData.modifiers)) {
    for (const modifierData of itemData.modifiers) {
      const sanitizedModifier = await assembleModifier(modifierData, menuItem);
      sanitizedItem.modifiers.push(sanitizedModifier);
    }
  } else if (menuItem.modifiers && menuItem.modifiers.length > 0) {
    // Check for required modifiers without selections
    for (const modifierId of menuItem.modifiers) {
      const modifier = await ModifierModel.findOne({
        _id: modifierId,
        restaurantId: restaurantId,
      }).lean();

      if (modifier && modifier.required) {
        throw new Error(
          `Modifier ${modifier.name} is required for item ${menuItem.name}`,
        );
      }
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
    !menuItem.modifiers.some((id) => id.toString() === modifierId.toString())
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
    max: modifier.max,
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
    // Enforce modifier-level 'multiple' and 'max' constraints
    if (!modifier.multiple && modifierData.options.length > 1) {
      throw new Error(
        `Modifier ${modifier.name} does not allow multiple selections`,
      );
    }

    let totalOptionQuantity = 0;

    for (const optionData of modifierData.options) {
      const option = await assembleOption(optionData, modifier, modifier.name);
      sanitizedModifier.options?.push(option);

      totalOptionQuantity += option.quantity;
    }

    // Enforce modifier-level 'max' constraint
    if (modifier.max !== undefined && totalOptionQuantity > modifier.max) {
      throw new Error(
        `Total quantity of options selected for modifier ${modifier.name} exceeds the maximum of ${modifier.max}`,
      );
    }
  }

  return sanitizedModifier as IModifier;
}

// Assemble option (addition) with quantity
async function assembleOption(
  optionData: any,
  modifier: IModifier,
  modifierName: string,
): Promise<IAddition> {
  const optionId = sanitizeObjectId(optionData._id, "option._id");

  // Find the option within the modifier's options
  const option: any = modifier.options.find(
    (opt: any) => opt._id && opt._id.equals(optionId),
  );

  if (!option) {
    throw new Error(
      `Option with _id ${optionId} not found in modifier ${modifierName}`,
    );
  }

  // Sanitize option quantity
  const quantity = sanitizeNumber(optionData.quantity, "option.quantity", {
    min: 1,
    integer: true,
  });

  // Enforce option-level 'multiple' and 'max' constraints
  if (!option.multiple && quantity > 1) {
    throw new Error(
      `Option ${option.name} in modifier ${modifierName} does not allow multiple quantities`,
    );
  }

  if (option.max !== undefined && quantity > option.max) {
    throw new Error(
      `Quantity for option ${option.name} in modifier ${modifierName} exceeds the maximum of ${option.max}`,
    );
  }

  const sanitizedOption: Partial<any> = {
    _id: option._id,
    name: option.name,
    price: option.price,
    quantity: quantity,
  };

  return sanitizedOption as IAddition;
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
