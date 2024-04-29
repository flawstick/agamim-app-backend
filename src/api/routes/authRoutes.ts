import express from "express";
import loginUser from "@/api/controllers/login";
import registerUser from "@/api/controllers/register";
import verifyToken from "@/api/controllers/verifyToken";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/verify", verifyToken);

export default router;
