import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { Request } from "express";

// ⭐ Map each field to its correct folder
const UPLOAD_DIRS: Record<string, string> = {
  visual_report: path.join(process.cwd(), "uploads", "visual_report"),
  detailed_report: path.join(process.cwd(), "uploads", "detailed_report"),
  assessment: path.join(process.cwd(), "uploads", "assessment"),
  records: path.join(process.cwd(), "uploads", "records"),
};

// ⭐ Ensure all folders exist
Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ⭐ Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = UPLOAD_DIRS[file.fieldname];
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;
    cb(null, uniqueName);
  },
});

// ⭐ Allowed MIME types
const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

// ⭐ File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

// ⭐ Export Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
