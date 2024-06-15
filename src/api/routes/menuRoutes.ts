import express from "express";
import { getAllMenuItems } from "@/api/controllers/menuController";

const router = express.Router();

router.get("/allItems", getAllMenuItems);

export default router;
