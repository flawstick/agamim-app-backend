import express from "express";
import createPost from "@/api/controllers/createPost";
import createFeed from "@/api/controllers/createFeed";

const router = express.Router();
router.post("/post", createPost);
router.get("/create", createFeed);

export default router;
