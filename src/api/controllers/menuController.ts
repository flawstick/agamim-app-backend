import { Request, Response } from "express";
import { Types } from "mongoose";
import MenuModel, { IMenuItem, ModifierModel } from "@/models/menu";
import { log } from "@/utils/log";
import { checkMember } from "@/menu/checkMember";
import {
  addModifier,
  updateModifier,
  removeModifier,
} from "@/menu/crudModifier";
import { getModifiers, getMenuItemsAndCategories } from "@/menu/fetchMenu";
import { linkMenuToRestaurant } from "@/menu/menuLink";
import {
  addCategory,
  getCategories,
  removeCategory,
  updateCategory,
} from "@/menu/crudCategory";
import { addMenuItem, updateMenuItem, removeMenuItem } from "@/menu/crudItems";
import { updateCategoryOrder } from "@/menu/orderCategories";
import { updateItemModifiers } from "@/menu/itemModifiers";

export async function authenticateUser(req: Request, res: Response, next: any) {
  let userId: string | undefined;

  try {
    userId = req.body.user.userId;
    if (!(await checkMember(req.params.restaurantId, userId as string)))
      return res
        .status(403)
        .json({ message: "User is not a member of this restaurant" });
    next();
  } catch (error) {
    log.error("Failed to get user ID:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getRestaurantMenu(req: Request, res: Response) {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  try {
    const menu = await MenuModel.findOne({ restaurantId });
    if (!menu) return res.status(204).json({ message: "No Menu." });
    if (!menu.items) {
      MenuModel.updateOne({ restaurantId }, { items: [] });
      return res.status(200).json([]);
    }

    if (!menu.categories) {
      menu.categories = [
        ...new Set(menu.items.map((item: IMenuItem) => item.category)),
      ] as any;
      await menu.save();
    }

    // replace modifier _ids with actual modifiers in item.modifiers
    for (let i = 0; i < menu.items.length; i++) {
      let item = menu.items[i];
      if (!item.modifiers) item.modifiers = [];

      let modifiers = [];
      for (let j = 0; j < item.modifiers?.length; j++) {
        let modifier = await ModifierModel.findById(item.modifiers[j]);
        if (modifier) modifiers.push(modifier);
      }

      menu.items[i].modifiers = modifiers as any;
    }

    // reorder menu categories based on category.index
    if (menu.categories)
      menu.categories.sort((a, b) => {
        return a.index - b.index;
      });

    // check the availability of each item
    const date = new Date();
    for (let i = menu.items.length - 1; i >= 0; i--) {
      let item = menu.items[i];
      if (!item.indexDaysAvailable?.includes(date.getDay())) {
        menu.items.splice(i, 1);
      }
    }

    log.info(`Fetched menu for restaurant ${restaurantId}`);
    linkMenuToRestaurant(restaurantId, menu._id);

    res.status(200).json({ items: menu.items, categories: menu.categories });
  } catch (error) {
    log.error("Failed to get restaurant menu:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createRestaurantMenu(req: Request, res: Response) {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  try {
    const menu = new MenuModel({ restaurantId, items: [] });
    await menu.save();
    log.info(`Created menu for restaurant ${restaurantId}`);
    res.status(201).json(menu);
  } catch (error) {
    log.error("Failed to create restaurant menu:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateRestaurantMenu(req: Request, res: Response) {
  const { restaurantId } = req.params;
  const { items } = req.body;

  if (!restaurantId) {
    log.warn(`Restaurant ID is required, received ${restaurantId}`);
    return res.status(400).json({ message: "Restaurant ID is required" });
  }

  if (!items) {
    log.warn(`Items are required, received ${items}`);
    return res.status(400).json({ message: "Items are required" });
  }

  try {
    const menu = await MenuModel.findOne({ restaurantId });
    if (!menu) {
      log.info(`No menu found for restaurant ${restaurantId}`);
      return res.status(204).json({ message: "No Menu." });
    }

    menu.items = items;
    menu.categories = [
      ...new Set(items.map((item: IMenuItem) => item.category)),
    ] as any;
    await menu.save();
    log.info(`Updated menu for restaurant ${restaurantId}`);
    res.status(200).json(menu);
  } catch (error) {
    log.error("Failed to update restaurant menu:", error as Error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createItem(req: Request, res: Response) {
  let item: any | undefined;

  try {
    item = req.body.item;
    await addMenuItem(
      new Types.ObjectId(req.params.restaurantId as string),
      item,
    );
    return res.status(200).json({ message: "Item added successfully" });
  } catch (error) {
    log.error("Failed to create item:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function editItem(req: Request, res: Response) {
  let item: any | undefined;
  let itemId: Types.ObjectId | undefined;

  try {
    item = req.body.item;
    itemId = new Types.ObjectId(req.params.itemId);

    await updateMenuItem(
      new Types.ObjectId(req.params.restaurantId as string),
      itemId,
      item,
    );
    return res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    log.error("Failed to edit item:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteItem(req: Request, res: Response) {
  let itemId: Types.ObjectId | undefined;
  let restaurantId: Types.ObjectId | undefined;

  try {
    itemId = new Types.ObjectId(req.params.itemId);
    restaurantId = new Types.ObjectId(req.params.restaurantId);
    await removeMenuItem(restaurantId, itemId);
    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    log.error("Failed to delete item:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function editItemModifiers(req: Request, res: Response) {
  let modifiers: string[] | undefined;
  let restaurantId: Types.ObjectId | undefined;
  let itemId: Types.ObjectId | undefined;

  try {
    modifiers = req.body.modifiers;
    restaurantId = new Types.ObjectId(req.params.restaurantId);
    itemId = new Types.ObjectId(req.params.itemId);

    await updateItemModifiers(restaurantId, itemId, modifiers as string[]);
    return res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    log.error("Failed to update item:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function createModifier(req: Request, res: Response) {
  let modifier: any;

  try {
    modifier = req.body.modifier;

    await addModifier(modifier);
    return res.status(200).json({ message: "Modifier added successfully" });
  } catch (error) {
    log.error("Failed to create modifier:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function putModifier(req: Request, res: Response) {
  let modifier: any;

  try {
    modifier = req.body.modifier;
    await updateModifier(req.params.mId, modifier);
    return res.status(200).json({ message: "Modifier updated successfully" });
  } catch (error) {
    log.error("Failed to update modifier:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function fetchModifiers(req: Request, res: Response) {
  try {
    let allModifiers = await getModifiers(req.params.restaurantId);
    return res.status(200).json(allModifiers);
  } catch (error) {
    log.error("Failed to get modifiers:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteModifier(req: Request, res: Response) {
  try {
    await removeModifier(req.params.mId);
    return res.status(200).json({ message: "Modifier deleted successfully" });
  } catch (error) {
    log.error("Failed to delete modifier:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getItemsAndCategories(req: Request, res: Response) {
  try {
    const body = await getMenuItemsAndCategories(req.params.restaurantId);
    return res.status(200).json({ ...body });
  } catch (error) {
    log.error("Failed to get items and categories:", error as Error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function createCategory(req: Request, res: Response) {
  let category: any;

  try {
    category = req.body.category;
    let menu = await MenuModel.findOne({
      restaurantId: new Types.ObjectId(req.params.restaurantId),
    });
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    await addCategory(menu?._id, category);
    return res.status(200).json({ message: "Category added successfully" });
  } catch (error) {
    log.error("Failed to create category:", error as Error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}

export async function editCategory(req: Request, res: Response) {
  let category: any;

  try {
    category = req.body.category;
    let menu = await MenuModel.findOne({
      restaurantId: new Types.ObjectId(req.params.restaurantId),
    });
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    await updateCategory(
      menu?._id,
      new Types.ObjectId(req.params.cId),
      category,
    );
    return res.status(200).json({ message: "Category added successfully" });
  } catch (error) {
    log.error("Failed to edit category:", error as Error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    let menu = await MenuModel.findOne({
      restaurantId: new Types.ObjectId(req.params?.restaurantId),
    });
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    await removeCategory(menu?._id, new Types.ObjectId(req.params?.cId));
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    log.error("Failed to delete category", error as Error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}

export async function fetchCategories(req: Request, res: Response) {
  try {
    let menu = await MenuModel.findOne({
      restaurantId: new Types.ObjectId(req.params?.restaurantId),
    });
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    let categories = await getCategories(menu?._id);
    return res
      .status(200)
      .json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    log.error("Failed to fetch categories:", error as Error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}

export async function orderCategories(req: Request, res: Response) {
  let categories: { _id: string; index: number }[];

  try {
    let menu = await MenuModel.findOne({
      restaurantId: new Types.ObjectId(req.params?.restaurantId),
    });
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    log.info("Ordering categories");

    categories = req.body?.categories;
    log.info(`Categories: ${categories}`);
    await updateCategoryOrder(menu?._id, categories);

    return res.status(200).json({ message: "Categories ordered successfully" });
  } catch (error) {
    log.error("Failed to order categories:", error as Error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}
