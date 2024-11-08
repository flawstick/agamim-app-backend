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
} from "@/api/controllers/menuController";
import {
  validateCreateCategory,
  validateRestaurantId,
} from "../validators/menuValidators";

const router = express.Router();

router.get("/:restaurantId/", authenticateUser, getItemsAndCategories);

router.post(
  "/:restaurantId/items/",
  authenticateUser,
  validateRestaurantId,
  createItem,
);
router.put(
  "/:restaurantId/items/:itemId",
  authenticateUser,
  validateRestaurantId,
  editItem,
);
router.delete(
  "/:restaurantId/items/:itemId",
  authenticateUser,
  validateRestaurantId,
  deleteItem,
);

router.get("/:restaurantId/modifiers/", authenticateUser, fetchModifiers);
router.post("/:restaurantId/modifiers/", authenticateUser, createModifier);
router.put("/:restaurantId/modifiers/:mId", authenticateUser, putModifier);
router.delete(
  "/:restaurantId/modifiers/:mId",
  authenticateUser,
  deleteModifier,
);

router.post(
  "/:restaurantId/categories/",
  authenticateUser,
  validateRestaurantId,
  validateCreateCategory,
  createCategory,
);
router.put(
  "/:restaurantId/categories/:cId",
  authenticateUser,
  validateRestaurantId,
  editCategory,
);
router.get(
  "/:restaurantId/categories/",
  authenticateUser,
  validateRestaurantId,
  fetchCategories,
);
router.delete(
  "/:restaurantId/categories/:cId",
  authenticateUser,
  validateRestaurantId,
  deleteCategory,
);

export default router;
