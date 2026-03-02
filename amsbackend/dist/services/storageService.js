"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFile = saveFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
// ⭐ Individual folders for each file type
const rootDir = process.cwd();
const UPLOAD_DIRS = {
    visual_report: path_1.default.join(rootDir, "uploads", "visual_report"),
    detailed_report: path_1.default.join(rootDir, "uploads", "detailed_report"),
    assessment: path_1.default.join(rootDir, "uploads", "assessment"),
    records: path_1.default.join(rootDir, "uploads", "records"),
};
// Ensure all folders exist
Object.values(UPLOAD_DIRS).forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
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
async function saveFile(file, field) {
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
            const fileName = `${(0, crypto_1.randomUUID)()}_${safeOriginal}`;
            const filePath = path_1.default.join(baseDir, fileName);
            // Write file
            fs_1.default.writeFile(filePath, file.buffer, (err) => {
                if (err)
                    return reject(err);
                resolve(fileName);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
//# sourceMappingURL=storageService.js.map