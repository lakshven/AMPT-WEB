import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// ⭐ Individual folders for each file type
const rootDir = process.cwd();

const UPLOAD_DIRS = {
  visual_report: path.join(rootDir, "uploads", "visual_report"),
  detailed_report: path.join(rootDir, "uploads", "detailed_report"),
  assessment: path.join(rootDir, "uploads", "assessment"),
  records: path.join(rootDir, "uploads", "records"),
} as const;

// Ensure all folders exist
Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ⭐ Save file buffer to the correct folder based on field name
export async function saveFile(
  file: Express.Multer.File,
  field: keyof typeof UPLOAD_DIRS
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return reject(new Error("Invalid file type"));
      }

      // Validate size
      if (file.size > MAX_SIZE_BYTES) {
        return reject(new Error("File too large"));
      }

      const baseDir = UPLOAD_DIRS[field];

      // Sanitize filename
      const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");

      // UUID filename
      const fileName = `${randomUUID()}_${safeOriginal}`;
      const filePath = path.join(baseDir, fileName);

      // Write file
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) return reject(err);
        resolve(fileName);
      });
    } catch (err) {
      reject(err);
    }
  });
}