import express from "express";
import {
  authenticateUser,
  createCategory,
  createModifier,
  deleteCategory,
  deleteModifier,
  editCategory,
  fetchModifiers,
  getItemsAndCategories,
  putModifier,
} from "@/api/controllers/menuController";
import { getCategories } from "@/menu/crudCategory";
import {
  validateCreateCategory,
  validateRestaurantId,
} from "../validators/menuValidators";

const router = express.Router();

router.get("/:restaurantId/", authenticateUser, getItemsAndCategories);

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
  getCategories,
);
router.delete(
  "/:restaurantId/categories/:cId",
  authenticateUser,
  validateRestaurantId,
  deleteCategory,
);

export default router;
