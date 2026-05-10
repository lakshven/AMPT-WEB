import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const rootDir = process.cwd();

export const UPLOAD_DIRS = {
  visual_report: path.join(rootDir, "uploads", "visual_report"),
  detailed_report: path.join(rootDir, "uploads", "detailed_report"),
  assessment: path.join(rootDir, "uploads", "assessment"),
  records: path.join(rootDir, "uploads", "records"),
} as const;

// Ensure folders exist
Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed MIME types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel", 
];

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Save file
export async function saveFile(
  file: Express.Multer.File,
  field: keyof typeof UPLOAD_DIRS
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return reject(
          new Error("Invalid file type. Allowed: PDF, DOC, DOCX, XLSX")
        );
      }

      // Validate size
      if (file.size > MAX_SIZE_BYTES) {
        return reject(new Error("File too large. Max size is 5MB"));
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

        // Return relative path (frontend friendly)
        resolve(fileName);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Delete file (used when transaction fails)
export function deleteFile(relativePath: string) {
  try {
    const fullPath = path.join(rootDir, "uploads", relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error("Failed to delete file:", err);
  }
}
