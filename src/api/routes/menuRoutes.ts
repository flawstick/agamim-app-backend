import express from "express";
import {
  authenticateUser,
  createModifier,
  deleteModifier,
  fetchModifiers,
  getAllMenuItems,
  getItemsAndCategories,
  putModifier,
} from "@/api/controllers/menuController";

const router = express.Router();

router.get("/allItems", getAllMenuItems);
router.get("/:restaurantId/modifiers/", authenticateUser, fetchModifiers);
router.post("/:restaurantId/modifiers/", authenticateUser, createModifier);
router.put("/:restaurantId/modifiers/:mId", authenticateUser, putModifier);
router.delete(
  "/:restaurantId/modifiers/:mId",
  authenticateUser,
  deleteModifier,
);
router.get("/:restaurantId/", authenticateUser, getItemsAndCategories);

export default router;
