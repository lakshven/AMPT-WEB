import express from "express";
import { attachUserContext } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { userActivityLogger } from "../middleware/userActivityLogger";


import { getUserActivity, getHourlyActivity, getWeeklyActivity, getActivityByCategory, getTopActiveUsers, getUserActivityByUserId } from "../controllers/userActivityController";
import { createAlert, listAlerts, markAlertsAsRead } from "../controllers/admin/alertsController";
import { getStats } from "../controllers/systemStatsController";
import {createAdmin} from "../controllers/admin/createAdmin";


const router = express.Router();
router.use(attachUserContext);
router.use(userActivityLogger);
// Alerts
router.post("/alerts/create", createAlert);
router.get("/alerts", listAlerts);
router.post("/alerts/mark-read", markAlertsAsRead);
// System Stats
router.get("/stats", getStats);
router.post("/create-admin", requireRole("app_admin"), createAdmin);
// User Activity Analytics
router.get("/user-activity",requireRole("app_admin"), getUserActivity);
router.get("/user-activity/hourly", requireRole("app_admin"), getHourlyActivity);
router.get("/user-activity/weekly", requireRole("app_admin"), getWeeklyActivity);
router.get("/user-activity/categories", requireRole("app_admin"), getActivityByCategory);
router.get("/user-activity/top-users", requireRole("app_admin"), getTopActiveUsers);
router.get("/user-activity/user/:id", requireRole("app_admin"),getUserActivityByUserId);

export default router;