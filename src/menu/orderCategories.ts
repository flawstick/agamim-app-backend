// **NOTE**: This file may be unstable.
// **Author**: [GitHub](https://github.com/flawstick) **Date**: 2024-11-9
import { Types, QueryWithHelpers } from "mongoose";
import MenuModel, { ICategory } from "@/models/menu";
import { log } from "@/utils/log";

/**
 * This function updates the order of the categories in a menu.
 * @param menuId - The ID of the menu to update.
 * @param categories - Array of categories with _id and index properties.
 * @returns Promise resolving to the updated menu document.
 */
export const updateCategoryOrder = async (
  menuId: Types.ObjectId,
  categories: { _id: string | Types.ObjectId; index: number }[],
): Promise<QueryWithHelpers<any, any>> => {
  // Fetch the menu document
  const menu = await MenuModel.findById(menuId);
  if (!menu) {
    throw new Error("Menu not found.");
  }
  log.info("Menu found");

  if (!menu.categories) {
    throw new Error("No categories found in the menu.");
  }

  // Sanitize and normalize the input categories
  categories = await sanitizeCategories(categories);
  log.info(`Categories sanitized: ${categories}`);

  // Check if all categories in the input exist in the menu's current categories
  const categoriesToUpdate = menu.categories.filter((cat: ICategory) =>
    categories.some((c) => c._id.toString() === cat._id.toString()),
  );
  if (categoriesToUpdate.length !== categories.length) {
    throw new Error("Missing categories in the menu.");
  }
  log.info("All categories found in the menu");

  // Map the updated indices to the categories
  const updatedCategories = menu.categories.map((cat: any) => {
    const matchingCategory = categories.find(
      (c) => c._id.toString() === cat._id.toString(),
    );
    return matchingCategory ? { ...cat, index: matchingCategory.index } : cat;
  });
  log.info(`Updated categories: ${updatedCategories}`);

  return MenuModel.findByIdAndUpdate(
    menuId,
    { categories: updatedCategories },
    { new: true },
  );
};

/**
 * Sanitizes the category data to ensure consistency, validity, and contiguous indexing.
 * @param categories - Array of category objects with _id and index.
 */
const sanitizeCategories = async (
  categories: { _id: string | Types.ObjectId; index: number }[],
): Promise<{ _id: Types.ObjectId; index: number }[]> => {
  // Check for duplicate indices
  const indexSet = new Set<number>();
  for (const category of categories) {
    if (indexSet.has(category.index)) {
      throw new Error("Duplicate index found in categories.");
    }
    indexSet.add(category.index);
  }

  // Sort categories by index, then normalize indices to start from 1
  return categories
    .map((category) => ({
      _id: new Types.ObjectId(category._id),
      index: category.index,
    }))
    .sort((a, b) => a.index - b.index)
    .map((category, i) => ({
      ...category,
      index: i + 1,
    }));
};
