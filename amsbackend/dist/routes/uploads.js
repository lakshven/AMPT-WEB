"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uploadController_1 = require("../controllers/uploadFile/uploadController");
const setDefaultFileController_1 = require("../controllers/files/setDefaultFileController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Multer in-memory storage (we save manually in storageService)
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// POST /api/upload  → Upload a file
router.post("/", auth_1.attachUserContext, upload.single("file"), uploadController_1.uploadFile);
// POST /api/upload/set-default-file
// Save "default" into DB for exam_report / assessment / records
router.post("/set-default-file", auth_1.attachUserContext, setDefaultFileController_1.setDefaultFile);
exports.default = router;
//# sourceMappingURL=uploads.js.map