import express from "express";
import { uploadFile } from "@/api/controllers/uploadController";
import uploadMiddleware from "@/api/controllers/uploadController";

const router = express.Router();

router.post("/image", uploadMiddleware, uploadFile);

export default router;
