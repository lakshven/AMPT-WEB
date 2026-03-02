"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const dashboardController_1 = require("../controllers/dashboard/dashboardController");
const router = (0, express_1.Router)();
// All dashboard routes require authentication
router.use(auth_1.attachUserContext);
// GET /api/dashboard  → full dashboard metrics
router.get("/", dashboardController_1.getDashboardMetrics);
// Optional: simple stats endpoint if you want it
router.get("/stats", dashboardController_1.getDashboardStats);
// ⭐ NEW: GET /api/dashboard/route-assets → route‑ordered map assets
router.get("/route-assets", dashboardController_1.getDashboardRouteAssets);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map