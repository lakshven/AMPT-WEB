import { Router, Request, Response } from "express";
import { signup } from "../controllers/auth/signupController";
import { login } from "../controllers/auth/loginController";
import { forgotPassword } from "../controllers/auth/forgotPasswordController";
import { resetPassword } from "../controllers/auth/resetPasswordController";
import bcrypt from "bcryptjs";   // ⭐ add this import
import { attachUserContext } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
const router = Router();

// ✅ Auth
router.post("/signup", attachUserContext, requireRole("app_admin"),signup);
router.post("/login", (req: Request, res: Response) => login(req, res));

// ✅ Password reset (token-based)
router.post("/forgot-password", (req: Request, res: Response) =>
  forgotPassword(req, res)
);

router.post("/reset-password/:token", (req: Request, res: Response) =>
  resetPassword(req, res)
);

// ⭐ TEMPORARY: Generate bcrypt hash for bootstrapping admin
router.get("/hash/:password", async (req: Request, res: Response) => {
  const password = Array.isArray(req.params.password)
    ? req.params.password[0]
    : req.params.password;

  const hash = await bcrypt.hash(password, 10);
  res.send(hash);
});

export default router;
