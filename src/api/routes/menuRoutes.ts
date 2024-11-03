import express from "express";
import {
  createModifier,
  getAllMenuItems,
  getItemsAndCategories,
} from "@/api/controllers/menuController";

const router = express.Router();

router.get("/allItems", getAllMenuItems);
router.post("/:restaurantId/modifiers/", createModifier);
router.get("/:restaurantId/items/", getItemsAndCategories);

export default router;
