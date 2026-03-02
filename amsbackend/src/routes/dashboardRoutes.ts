import { Router } from "express";
import { attachUserContext } from "../middleware/auth";
import { getDashboardStats, getDashboardMetrics, getDashboardRouteAssets,} from "../controllers/dashboard/dashboardController";

const router = Router();

// All dashboard routes require authentication
router.use(attachUserContext);

// GET /api/dashboard  → full dashboard metrics
router.get("/", getDashboardMetrics);

// Optional: simple stats endpoint if you want it
router.get("/stats", getDashboardStats);
// ⭐ NEW: GET /api/dashboard/route-assets → route‑ordered map assets
router.get("/route-assets", getDashboardRouteAssets);

export default router;