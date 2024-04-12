import express from "express";
import loginUser from "@/api/controllers/login";

const router = express.Router();

router.post("/login", loginUser);

export default router;
