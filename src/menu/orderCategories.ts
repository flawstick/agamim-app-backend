import { QueryWithHelpers, Types } from "mongoose";
import { MenuModel, ICategory } from "@/models/menu";

/*
 * This function updates the order of the categories
 *  @param menuId - the ID of the menuId
 *  @param categories - { _id: string, index: number }[]
 *  */
export const updateCategoryOrder = async (
  menuId: Types.ObjectId,
  categories: { _id: string | Types.ObjectId; index: number }[],
): Promise<QueryWithHelpers<any, any>> => {
  const menu = await MenuModel.findById(menuId);
  if (!menu) {
    throw new Error("Menu not found.");
  }

  if (!menu.categories) {
    throw new Error("No categories found in the menu.");
  }

  categories = await sanitizeCategories(categories); // Sanitize data

  // Check if all categories exist in the menu
  const categoriesToUpdate = menu.categories.filter((cat: ICategory) =>
    categories.some((c) => c._id === cat._id.toString()),
  );
  if (categoriesToUpdate.length !== categories.length) {
    throw new Error("Missing categories in the menu.");
  }

  const updatedCategories = categoriesToUpdate.map((cat) => {
    const category = categories.find(
      (c) => c._id.toString() === cat._id.toString(),
    );
    return { ...cat, index: category?.index };
  });

  return MenuModel.findByIdAndUpdate(menuId, { categories: updatedCategories });
};

/*
 * This function sanitizes the categories
 *  @param categories - { _id: string, index: number }[]
 *  @returns { _id: Types.ObjectId, index: number }[]
 *  */
async function sanitizeCategories(
  categories: { _id: string | Types.ObjectId; index: number }[],
): Promise<{ _id: Types.ObjectId | string; index: number }[]> {
  return categories.map((cat) => {
    return {
      _id:
        cat._id === undefined
          ? new Types.ObjectId()
          : new Types.ObjectId(cat._id),
      index: cat.index === undefined ? 0 : cat.index,
    };
  });
}
