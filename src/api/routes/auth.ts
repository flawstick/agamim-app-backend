import express from "express";
import loginUser from "@/api/controllers/login";
import registerUser from "@/api/controllers/register";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
