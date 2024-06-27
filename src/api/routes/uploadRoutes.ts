import { Router } from "express";
import {
  uploadMiddleware,
  uploadChunk,
  completeUpload,
} from "../controllers/uploadController";

const router = Router();

router.post("/chunk", uploadMiddleware, uploadChunk);
router.post("/complete", completeUpload);

export default router;
