"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const requirePermission_1 = require("../middleware/requirePermission");
const adminUserController_1 = require("../controllers/admin/adminUserController");
const adminGroupController_1 = require("../controllers/admin/adminGroupController");
const router = express_1.default.Router();
router.use(auth_1.attachUserContext);
router.post("/users/:userId/role", adminUserController_1.assignRoleToUser);
router.post("/users/:userId/groups", (0, requirePermission_1.requirePermission)("MANAGE_USERS"), adminGroupController_1.addUserToGroup);
exports.default = router;
//# sourceMappingURL=admin.js.map