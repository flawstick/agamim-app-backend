import express from "express";
import { addToCart } from "@/api/controllers/addToCart";
import { getOrder } from "@/api/controllers/getOrder";
import { updateOrderStatus } from "@/api/controllers/updateOrderStatus";
import {
  authenticateTenant,
  getActiveOrders,
  getUserOrders,
  postOrder,
} from "@/api/controllers/orderController";
import { extractTenantId } from "@/orders/orderAuth";
import {
  getRestaurantOrdersForConsole,
  getRestaurantOrdersForTablet,
} from "@/api/controllers/resturantController";
import { getCompanyOrdersForConsole } from "@/api/controllers/companyController";

const router = express.Router();

router.get("/own-orders", getUserOrders);
router.get("/company/:tenantId", getCompanyOrdersForConsole);
router.get("/restaurant/:restaurantId/tablet/", getRestaurantOrdersForTablet);
router.get("/restaurant/:restaurantId", getRestaurantOrdersForConsole);
router.post("/", authenticateTenant, postOrder);
router.get("/active", authenticateTenant, getActiveOrders);
router.post("/cart", extractTenantId, addToCart);
router.get("/:orderId", getOrder);
router.put("/:orderId/status", updateOrderStatus);

export default router;
