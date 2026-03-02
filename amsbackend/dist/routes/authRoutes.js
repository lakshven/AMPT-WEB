"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signupController_1 = require("../controllers/auth/signupController");
const loginController_1 = require("../controllers/auth/loginController");
const forgotPasswordController_1 = require("../controllers/auth/forgotPasswordController");
const resetPasswordController_1 = require("../controllers/auth/resetPasswordController");
const bcryptjs_1 = __importDefault(require("bcryptjs")); // ⭐ add this import
const router = (0, express_1.Router)();
// ✅ Auth
router.post("/signup", (req, res) => (0, signupController_1.signup)(req, res));
router.post("/login", (req, res) => (0, loginController_1.login)(req, res));
// ✅ Password reset (token-based)
router.post("/forgot-password", (req, res) => (0, forgotPasswordController_1.forgotPassword)(req, res));
router.post("/reset-password/:token", (req, res) => (0, resetPasswordController_1.resetPassword)(req, res));
// ⭐ TEMPORARY: Generate bcrypt hash for bootstrapping admin
router.get("/hash/:password", async (req, res) => {
    const password = Array.isArray(req.params.password)
        ? req.params.password[0]
        : req.params.password;
    const hash = await bcryptjs_1.default.hash(password, 10);
    res.send(hash);
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map