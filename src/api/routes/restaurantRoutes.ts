import express from "express";
import {
  createRestaurant,
  getRestaurantData,
} from "@/api/controllers/resturantController";
import {
  createRestaurantMenu,
  updateRestaurantMenu,
  getRestaurantMenu,
} from "@/api/controllers/menuController";

const router = express.Router();

router.post("/create", createRestaurant);
router.post("/:restaurantId/menu/create", createRestaurantMenu);
router.put("/:restaurantId/menu/", updateRestaurantMenu);
router.get("/:restaurantId/data", getRestaurantData);
router.get("/:restaurantId/menu", getRestaurantMenu);

export default router;
