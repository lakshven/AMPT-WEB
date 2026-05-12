import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploadFile/uploadController";
import { setDefaultFile } from "../controllers/files/setDefaultFileController";
import { downloadFile } from "../controllers/files/downloadFileController";
import { attachUserContext } from "../middleware/auth";

const router = Router();

// Multer in-memory storage (we save manually in storageService)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// POST /api/upload  → Upload a file
router.post(
  "/",
  attachUserContext,
  upload.fields([
  { name: "visual_report", maxCount: 1 },
  { name: "detailed_report", maxCount: 1 },
  { name: "assessment", maxCount: 1 },
  { name: "records", maxCount: 20 },
]),
  uploadFile
);

// POST /api/upload/set-default-file
// Save "default" into DB for exam_report / assessment / records
router.post(
  "/set-default-file",
  attachUserContext,
  setDefaultFile
);

// ⭐ NEW — GET /api/upload/download
router.get(
  "/download",
  attachUserContext,
  downloadFile
);

export default router;
