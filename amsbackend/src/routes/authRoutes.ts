import { Router, Request, Response } from "express";
import { signup } from "../controllers/auth/signupController";
import { login } from "../controllers/auth/loginController";
import { forgotPassword } from "../controllers/auth/forgotPasswordController";
import { resetPassword } from "../controllers/auth/resetPasswordController";
import bcrypt from "bcryptjs";   
import { attachUserContext } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// ✅ Signup (Protected) Auth
router.post("/signup", attachUserContext, requireRole("app_admin"),signup);
//Login For Public
router.post("/login", login);

// ✅ Password reset (token-based)
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

// ⭐ TEMPORARY: Generate bcrypt hash for bootstrapping admin

export default router;

