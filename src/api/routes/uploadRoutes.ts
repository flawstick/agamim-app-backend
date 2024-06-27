import { Router } from "express";
import {
  uploadMiddleware,
  uploadChunk,
  completeUpload,
} from "../controllers/uploadController";

const router = Router();

router.post("/upload/chunk", uploadMiddleware, uploadChunk);
router.post("/upload/complete", completeUpload);

export default router;
