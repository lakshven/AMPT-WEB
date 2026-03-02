"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultFile = setDefaultFile;
const client_1 = __importDefault(require("../../prisma/client"));
async function setDefaultFile(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { rowId, column } = req.body;
        if (!column || !rowId) {
            return res.status(400).json({
                success: false,
                message: "Missing  column or rowId",
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
        // Save "default" as the chosen file
        const updated = await client_1.default.assets.update({
            where: { id: Number(rowId) },
            data: { [column]: "default" },
        });
        return res.json({
            success: true,
            message: "Default file selected successfully",
            asset: updated,
        });
    }
    catch (error) {
        console.error("Default file error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error selecting default file",
        });
    }
}
//# sourceMappingURL=setDefaultFileController.js.map