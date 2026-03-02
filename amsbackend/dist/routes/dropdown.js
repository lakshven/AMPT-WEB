"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dropDownController_1 = __importDefault(require("../controllers/dropdown/dropDownController"));
const getAllDropdowns_1 = __importDefault(require("../controllers/dropdown/getAllDropdowns"));
const addValue_1 = __importDefault(require("../controllers/dropdown/addValue"));
const deleteValue_1 = __importDefault(require("../controllers/dropdown/deleteValue"));
const restoreValue_1 = __importDefault(require("../controllers/dropdown/restoreValue"));
const getDeletedValues_1 = require("../controllers/dropdown/getDeletedValues");
const restoreAll_1 = __importDefault(require("../controllers/dropdown/restoreAll"));
const requireRole_1 = require("../middleware/requireRole");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.attachUserContext);
router.get("/static", dropDownController_1.default);
router.get("/all", getAllDropdowns_1.default);
router.post("/:category", (0, requireRole_1.requireRole)("app_admin"), addValue_1.default);
router.delete("/:category/:value", (0, requireRole_1.requireRole)("app_admin"), deleteValue_1.default);
router.get("/:category/deleted", (0, requireRole_1.requireRole)("app_admin"), getDeletedValues_1.getDeletedValues);
router.post("/:category/:value/restore", (0, requireRole_1.requireRole)("app_admin"), restoreValue_1.default);
router.post("/:category/restore-all", (0, requireRole_1.requireRole)("app_admin"), restoreAll_1.default);
exports.default = router;
//# sourceMappingURL=dropdown.js.map