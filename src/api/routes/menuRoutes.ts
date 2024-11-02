import express from "express";
import {
  createModifier,
  getAllMenuItems,
} from "@/api/controllers/menuController";

const router = express.Router();

router.get("/allItems", getAllMenuItems);
router.post("/:restaurantId/modifiers/", createModifier);

export default router;
