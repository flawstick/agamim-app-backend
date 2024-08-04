import express from "express";
import loginUser from "@/api/controllers/login";
import verifyToken from "@/api/controllers/verifyToken";
import { googleAuth } from "@/api/controllers/accountController";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify", verifyToken);

router.post("/app/google", googleAuth);

export default router;
