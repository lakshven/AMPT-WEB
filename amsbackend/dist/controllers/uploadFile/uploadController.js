"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
const client_1 = __importDefault(require("../../prisma/client"));
const storageService_1 = require("../../services/storageService");
async function uploadFile(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const file = req.file;
        const { rowId, column } = req.body;
        if (!file || !column || !rowId) {
            return res.status(400).json({
                success: false,
                message: "Missing file, rowId, or column",
            });
        }
        const numericRowId = Number(rowId);
        if (!Number.isInteger(numericRowId) ||
            numericRowId <= 0 ||
            numericRowId > 2147483647) {
            return res.status(400).json({
                success: false,
                message: "Invalid asset ID",
            });
        }
        // Save file to disk (with validation inside)
        const savedPath = await (0, storageService_1.saveFile)(file, column);
        // Update DB
        const updated = await client_1.default.assets.update({
            where: { id: Number(rowId) },
            data: { [column]: savedPath },
        });
        return res.json({
            success: true,
            message: "File uploaded successfully",
            fileUrl: savedPath,
            asset: updated,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        if (error.message === "Invalid file type") {
            return res.status(400).json({
                success: false,
                message: "Invalid file type. Only Excel files are allowed.",
            });
        }
        if (error.message === "File too large") {
            return res.status(400).json({
                success: false,
                message: "File too large. Max size is 5 MB.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Server error uploading file",
        });
    }
}
//# sourceMappingURL=uploadController.js.map