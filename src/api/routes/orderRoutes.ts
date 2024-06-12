import express from "express";
import { createOrder } from "@/api/controllers/createOrder";
import { addToCart } from "@/api/controllers/addToCart";
import { getOrder } from "@/api/controllers/getOrder";
import { updateOrderStatus } from "@/api/controllers/updateOrderStatus";
import { extractTenantId } from "@/orders/orderAuth";

const router = express.Router();

router.post("/order", extractTenantId, createOrder);
router.post("/cart", extractTenantId, addToCart);
router.get("/order/:orderId", extractTenantId, getOrder);
router.put("/order/:orderId/status", extractTenantId, updateOrderStatus);

export default router;
