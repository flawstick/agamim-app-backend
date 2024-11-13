// File to handle item modifiers
// Sanitizing and updating the array of
// modifier _ids in the item object
import MenuModel, { ModifierModel } from "@/models/menu";
import { QueryWithHelpers, Types } from "mongoose";

// *
// Update the modifiers of an item
// item exists in menu.items, no item model.
// @param restaurantId - the restaurant _id
// @param itemId - the item _id
// @param modifierIds - the array of modifier _ids
// @returns Promise resolving to the updated item document
// *
export async function updateItemModifiers(
  restaurantId: Types.ObjectId,
  itemId: Types.ObjectId,
  modifierIds: string[],
): Promise<QueryWithHelpers<any, any>> {
  // Find menu by restaurantId
  let menu = await MenuModel.findOne({ restaurantId });
  if (!menu) {
    throw new Error("Menu not found.");
  }

  // Find item in the menu
  let item = menu.items.find(
    (item) => item?._id?.toString() === itemId.toString(),
  );
  if (!item) {
    throw new Error("Item not found in the menu.");
  }

  // Sanitize modifierIds
  let sanitizedModifierIds = sanitizeModifierIds(modifierIds);

  // Check if all modifiers in the input exist
  const modifiers = await ModifierModel.find({
    _id: { $in: sanitizedModifierIds },
  });
  if (modifiers.length !== sanitizedModifierIds.length) {
    throw new Error("Missing modifiers in the input.");
  }

  return MenuModel.updateOne(
    { "items._id": itemId },
    { $set: { "items.$.modifiers": modifierIds } },
  );
}

// *
// Sanitize the modifierIds array to ensure
// all elements are valid ObjectIds
// @param modifierIds - the array of modifier _ids
// @returns the sanitized array of modifier _ids
// *
export function sanitizeModifierIds(modifierIds: string[]): Types.ObjectId[] {
  let modifiers = modifierIds.map((id) => new Types.ObjectId(id));
  if (!Array.isArray(modifiers)) {
    throw new Error("Invalid modifierIds.");
  }

  return modifiers;
}
