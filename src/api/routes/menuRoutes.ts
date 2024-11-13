import express from "express";
import {
  authenticateUser,
  createCategory,
  createModifier,
  deleteCategory,
  deleteModifier,
  fetchCategories,
  editCategory,
  fetchModifiers,
  getItemsAndCategories,
  putModifier,
  createItem,
  editItem,
  deleteItem,
  orderCategories,
  editItemModifiers,
} from "@/api/controllers/menuController";
import {
  handleValidationErrors,
  validateCategoryOrder,
  validateCreateCategory,
  validateRestaurantId,
} from "../validators/menuValidators";
import { updateItemModifiers } from "@/menu/itemModifiers";

const router = express.Router();

router.get("/:restaurantId/", authenticateUser, getItemsAndCategories);

// *
// * Item routes
// * All CRUD operations for items
// * GET /:restaurantId/items/ - Fetch all items for a restaurant
// *
router.post(
  "/:restaurantId/items/",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  createItem,
);
router.put(
  "/:restaurantId/items/:itemId",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  editItem,
);
router.delete(
  "/:restaurantId/items/:itemId",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  deleteItem,
);
router.put(
  "/:restaurantId/items/:itemId/modifiers",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  editItemModifiers,
);

// *
// * Modifier routes
// * All CRUD operations for modifiers
// * GET /:restaurantId/modifiers/ - Fetch all modifiers for a restaurant
// *
router.get(
  "/:restaurantId/modifiers/",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  fetchModifiers,
);
router.post(
  "/:restaurantId/modifiers/",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  createModifier,
);
router.put(
  "/:restaurantId/modifiers/:mId",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  putModifier,
);
router.delete(
  "/:restaurantId/modifiers/:mId",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  deleteModifier,
);

// *
// * Category routes
// * All CRUD operations for categories
// * GET /:restaurantId/categories/ - Fetch all categories for a restaurant
// *
router.put(
  "/:restaurantId/categories/order",
  authenticateUser,
  validateRestaurantId,
  validateCategoryOrder,
  handleValidationErrors,
  orderCategories,
);
router.post(
  "/:restaurantId/categories/",
  authenticateUser,
  validateRestaurantId,
  validateCreateCategory,
  handleValidationErrors,
  createCategory,
);
router.put(
  "/:restaurantId/categories/:cId",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  editCategory,
);
router.get(
  "/:restaurantId/categories/",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  fetchCategories,
);
router.delete(
  "/:restaurantId/categories/:cId",
  authenticateUser,
  validateRestaurantId,
  handleValidationErrors,
  deleteCategory,
);

export default router;
