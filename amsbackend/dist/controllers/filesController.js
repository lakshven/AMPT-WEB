"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamExcel = void 0;
const node_path_1 = __importDefault(require("node:path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const rootDir = process.cwd();
const TYPE_CONFIG = {
    exam_report: {
        field: "exam_report",
        baseDir: node_path_1.default.join(rootDir, "uploads", "exam_report"),
        default: node_path_1.default.join(rootDir, "public", "defaults", "Heritage Railways.xlsx"),
    },
    assessment: {
        field: "assessment",
        baseDir: node_path_1.default.join(rootDir, "uploads", "assessment"),
        default: node_path_1.default.join(rootDir, "public", "defaults", "Heritage Railways.xlsx"),
    },
    records: {
        field: "records",
        baseDir: node_path_1.default.join(rootDir, "uploads", "records"),
        default: node_path_1.default.join(rootDir, "public", "defaults", "Heritage Railways.xlsx"),
    },
};
const streamExcel = async (req, res) => {
    try {
        const { type, id } = req.params;
        const config = TYPE_CONFIG[type];
        if (!config) {
            res.status(400).json({ message: "Invalid type" });
            return;
        }
        const asset = await prismaClient().assets.findUnique({
            where: { id: Number(id) },
            select: { [config.field]: true },
        });
        if (!asset) {
            res.status(404).json({ message: "Asset not found" });
            return;
        }
        const relPath = asset[config.field];
        let filePath;
        // ⭐ NEW: If user explicitly selected default file
        if (relPath === "default") {
            filePath = config.default;
        }
        else if (relPath) {
            const safePath = node_path_1.default.join(config.baseDir, node_path_1.default.basename(relPath));
            filePath = fs_1.default.existsSync(safePath) ? safePath : config.default;
        }
        else {
            filePath = config.default;
        }
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `inline; filename="${node_path_1.default.basename(filePath)}"`);
        const stream = fs_1.default.createReadStream(filePath);
        stream.on("error", (err) => {
            console.error("Stream error:", err);
            res.status(500).end();
        });
        stream.pipe(res);
    }
    catch (err) {
        console.error("File streaming error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.streamExcel = streamExcel;
//# sourceMappingURL=filesController.js.map