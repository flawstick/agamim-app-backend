import express from "express";
import {
  getAccount,
  getAccountRestaurants,
} from "@/api/controllers/accountController";

const router = express.Router();

router.get("/:jwt", getAccount);
router.get("/:accountId/restaurants", getAccountRestaurants);

export default router;
