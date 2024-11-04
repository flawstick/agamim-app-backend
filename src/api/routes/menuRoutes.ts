import express from "express";
import {
  createModifier,
  fetchModifiers,
  getAllMenuItems,
  getItemsAndCategories,
} from "@/api/controllers/menuController";

const router = express.Router();

router.get("/allItems", getAllMenuItems);
router.post("/:restaurantId/modifiers/", createModifier);
router.get("/:restaurantId/modifiers/", fetchModifiers);
router.get("/:restaurantId/", getItemsAndCategories);

export default router;
