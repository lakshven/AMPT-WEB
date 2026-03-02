import express from "express";
import { attachUserContext } from "../middleware/auth";
import { getPermissions } from "../controllers/auth/permissionController";

const router = express.Router();

// ⭐ Gracefully handle missing tokens for background probes
router.use(attachUserContext);

// GET /api/me — return authenticated user
router.get("/", (req, res) => {
  res.json({ user: req.user });
});

// GET /api/me/permissions — return user's permissions
router.get("/permissions", getPermissions);

export default router;