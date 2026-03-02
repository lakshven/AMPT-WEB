"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const getUserById_1 = require("../controllers/users/getUserById");
const getUsers_1 = require("../controllers/users/getUsers");
const getAssignableUsers_1 = require("../controllers/users/getAssignableUsers");
const createUser_1 = require("../controllers/users/createUser");
const updateUser_1 = require("../controllers/users/updateUser");
const deleteUser_1 = require("../controllers/users/deleteUser");
const restoreUser_1 = require("../controllers/users/restoreUser");
const router = express_1.default.Router();
// Full users list (pagination + filters)
router.get("/list", auth_1.attachUserContext, getUsers_1.getUsers);
router.get("/", auth_1.attachUserContext, getAssignableUsers_1.getAssignableUsers);
router.post("/", auth_1.attachUserContext, createUser_1.createUser);
router.get("/:id", auth_1.attachUserContext, getUserById_1.getUserById);
router.put("/:id", auth_1.attachUserContext, updateUser_1.updateUser);
router.delete("/:id", auth_1.attachUserContext, deleteUser_1.deleteUser);
router.put("/:id/restore", auth_1.attachUserContext, restoreUser_1.restoreUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map