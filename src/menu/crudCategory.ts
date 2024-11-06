import { MenuModel, ICategoryLean, ICategory } from "@/models/menu";
import { Types } from "mongoose";

// *
// Add a category to the menu
// @param menuId - the ID of the menu
// @param category - the category object to add
// *
export const addCategory = async (
  menuId: Types.ObjectId,
  category: { name: string; description: string; index: number },
) => {
  const menu = await MenuModel.findById(menuId);
  const sanitizedCategory = sanitizeCategory(category);

  // Check for duplicate name
  if (
    menu?.categories?.some(
      (cat: ICategoryLean) => cat.name === sanitizedCategory.name,
    )
  ) {
    throw new Error("Category name already exists in the menu.");
  }

  // Add new category with a unique _id
  const newCategory = { ...sanitizedCategory, _id: new Types.ObjectId() };
  return MenuModel.findByIdAndUpdate(
    menuId,
    { $push: { categories: newCategory } },
    { new: true },
  );
};

// *
// Update a category in the menu
// @param menuId - the ID of the menu
// @param categoryId - the category _id to update
// @param newCategoryData - the new category data
// *
export const updateCategory = async (
  menuId: Types.ObjectId,
  categoryId: Types.ObjectId,
  newCategoryData: { name: string; description: string; index: number },
) => {
  const menu = await MenuModel.findById(menuId);
  const sanitizedCategory = sanitizeCategory(newCategoryData);

  if (!menu) {
    throw new Error("Menu not found.");
  }

  // Check if the category to update exists
  const existingCategory = menu?.categories?.find(
    (cat: ICategory) => cat._id.toString() === categoryId?.toString(),
  );
  if (!existingCategory) {
    throw new Error("Category not found in the menu.");
  }

  // Check for duplicate name in other categories
  if (
    menu?.categories?.some(
      (cat: ICategory) =>
        cat.name === sanitizedCategory.name &&
        cat._id.toString() !== categoryId?.toString(),
    )
  ) {
    throw new Error("Another category with the same name already exists.");
  }

  // Update category with sanitized data
  return MenuModel.findOneAndUpdate(
    { _id: menuId, "categories._id": categoryId },
    {
      $set: {
        "categories.$.name": sanitizedCategory.name,
        "categories.$.description": sanitizedCategory.description,
        "categories.$.index": sanitizedCategory.index,
      },
    },
    { new: true },
  );
};

// *
// Remove a category from the menu
// @param menuId - the ID of the menu
// @param categoryId - the category _id to remove
// *
export const removeCategory = async (
  menuId: Types.ObjectId,
  categoryId: Types.ObjectId,
) => {
  return MenuModel.findByIdAndUpdate(
    menuId,
    { $pull: { categories: { _id: new Types.ObjectId(categoryId) } } },
    { new: true },
  );
};

// *
// Get all categories in a menu
// @param menuId - the ID of the menu
// *
export const getCategories = async (menuId: Types.ObjectId | undefined) => {
  const menu = await MenuModel.findById(menuId, "categories");
  return menu ? menu.categories : [];
};

// *
// Sanitize category data to ensure only allowed fields are processed
// @param category - the category object to sanitize
// *
const sanitizeCategory = (category: {
  name: string;
  description: string;
  index: number;
}) => {
  return {
    name: typeof category.name === "string" ? category.name.trim() : "",
    description:
      typeof category.description === "string"
        ? category.description.trim()
        : "",
    index:
      typeof category.index === "number" && category.index >= 0
        ? category.index
        : 0,
  };
};
