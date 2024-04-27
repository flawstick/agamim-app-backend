import express from "express";
import createPost from "@/api/controllers/createPost";

const router = express.Router();
router.post("/create", createPost);

export default router;
