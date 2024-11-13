import { MenuModel, IMenuItem } from "@/models/menu";
import { Types } from "mongoose";

// *
// Add a menu item to the menu
// @param menuId - the ID of the menu
// @param item - the menu item object to add
// *
export const addMenuItem = async (
  restaurantId: Types.ObjectId,
  item: ItemData,
) => {
  const menu = await MenuModel.findOne({ restaurantId });
  const sanitizedItem = sanitizeMenuItem(item);

  // Check for duplicate item name within the same menu
  if (
    menu?.items?.some(
      (menuItem: IMenuItem) => menuItem.name === sanitizedItem.name,
    )
  ) {
    throw new Error("Menu item name already exists in the menu.");
  }

  const newItem = { ...sanitizedItem, _id: new Types.ObjectId() };
  return MenuModel.findByIdAndUpdate(
    menu?._id,
    { $push: { items: newItem } },
    { new: true },
  );
};

// *
// Update a menu item in the menu
// @param menuId - the ID of the menu
// @param itemId - the item _id to update
// @param newItemData - the new item data
// *
export const updateMenuItem = async (
  restaurantId: Types.ObjectId,
  itemId: Types.ObjectId,
  newItemData: ItemData,
) => {
  const menu = await MenuModel.findOne({ restaurantId });
  const sanitizedItem = sanitizeMenuItem(newItemData);

  if (!menu) {
    throw new Error("Menu not found.");
  }

  // Check if the item to update exists
  const existingItem = menu.items.find(
    (item: IMenuItem) => item._id?.toString() === itemId?.toString(),
  );
  if (!existingItem) {
    throw new Error("Menu item not found in the menu.");
  }

  // Update item with sanitized data
  return MenuModel.findOneAndUpdate(
    { _id: menu._id, "items._id": itemId },
    {
      $set: {
        "items.$.name": sanitizedItem.name,
        "items.$.price": sanitizedItem.price,
        "items.$.description": sanitizedItem.description,
        "items.$.imageUrl": sanitizedItem.imageUrl,
        "items.$.category": sanitizedItem.category,
        "items.$.modifiers": sanitizedItem.modifiers,
        "items.$.vegan": sanitizedItem.vegan,
        "items.$.isSpicy": sanitizedItem.isSpicy,
        "items.$.spiceLevel": sanitizedItem.spiceLevel,
        "items.$.indexDaysAvailable": sanitizedItem.indexDaysAvailable,
      },
    },
    { new: true },
  );
};

// *
// Remove a menu item from the menu
// @param menuId - the ID of the menu
// @param itemId - the item _id to remove
// *
export const removeMenuItem = async (
  restaurantId: Types.ObjectId,
  itemId: Types.ObjectId,
) => {
  let menu = await MenuModel.findOne({
    restaurantId,
    items: { $elemMatch: { _id: itemId } },
  });

  if (!menu) {
    throw new Error("Menu item not found in the menu.");
  }

  return MenuModel.findByIdAndUpdate(
    menu._id,
    { $pull: { items: { _id: new Types.ObjectId(itemId) } } },
    { new: true },
  );
};

// *
// Get all items in a menu
// @param menuId - the ID of the menu
// *
export const getMenuItems = async (menuId: Types.ObjectId | undefined) => {
  const menu = await MenuModel.findById(menuId, "items");
  return menu ? menu.items : [];
};

// *
// Sanitize menu item data to ensure only allowed fields are processed
// @param item - the menu item object to sanitize
// *
const sanitizeMenuItem = (item: any) => {
  return {
    name: typeof item?.name === "string" ? item.name.trim() : "",
    price: typeof item?.price === "number" && item.price > 0 ? item.price : 0,
    description:
      typeof item?.description === "string" ? item.description.trim() : "",
    imageUrl: typeof item?.imageUrl === "string" ? item.imageUrl.trim() : "",
    category: typeof item?.category === "string" ? item.category.trim() : "",
    indexDaysAvailable:
      typeof item?.indexDaysAvailable === "object"
        ? item.indexDaysAvailable
        : [],
    modifiers: Array.isArray(item?.modifiers) ? item.modifiers : [],
    vegan: typeof item?.vegan === "boolean" ? item.vegan : false,
    isSpicy: typeof item?.isSpicy === "boolean" ? item.isSpicy : false,
    spiceLevel: typeof item?.spiceLevel === "number" ? item.spiceLevel : 0,
  };
};

// Type definitions
type ItemData = {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  modifiers?: Types.ObjectId[];
  indexDaysAvailable?: number[];
  vegan?: boolean;
  isSpicy?: boolean;
  spiceLevel?: number;
  sold?: number;
};
