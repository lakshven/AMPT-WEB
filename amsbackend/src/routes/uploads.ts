import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploadFile/uploadController";
import { setDefaultFile } from "../controllers/files/setDefaultFileController";
import { attachUserContext } from "../middleware/auth";

const router = Router();

// Multer in-memory storage (we save manually in storageService)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload  → Upload a file
router.post(
  "/",
  attachUserContext,
  upload.single("file"),
  uploadFile
);

// POST /api/upload/set-default-file
// Save "default" into DB for exam_report / assessment / records
router.post(
  "/set-default-file",
  attachUserContext,
  setDefaultFile
);

export default router;