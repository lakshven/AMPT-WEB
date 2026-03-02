"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const permissionController_1 = require("../controllers/auth/permissionController");
const router = express_1.default.Router();
// ⭐ Gracefully handle missing tokens for background probes
router.use(auth_1.attachUserContext);
// GET /api/me — return authenticated user
router.get("/", (req, res) => {
    res.json({ user: req.user });
});
// GET /api/me/permissions — return user's permissions
router.get("/permissions", permissionController_1.getPermissions);
exports.default = router;
//# sourceMappingURL=meRoutes.js.map