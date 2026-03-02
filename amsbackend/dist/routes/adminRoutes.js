"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const requireRole_1 = require("../middleware/requireRole");
const userActivityLogger_1 = require("../middleware/userActivityLogger");
const userActivityController_1 = require("../controllers/userActivityController");
const alertsController_1 = require("../controllers/admin/alertsController");
const systemStatsController_1 = require("../controllers/systemStatsController");
const createAdmin_1 = require("../controllers/admin/createAdmin");
const router = express_1.default.Router();
router.use(auth_1.attachUserContext);
router.use(userActivityLogger_1.userActivityLogger);
// Alerts
router.post("/alerts/create", alertsController_1.createAlert);
router.get("/alerts", alertsController_1.listAlerts);
router.post("/alerts/mark-read", alertsController_1.markAlertsAsRead);
// System Stats
router.get("/stats", systemStatsController_1.getStats);
router.post("/create-admin", (0, requireRole_1.requireRole)("app_admin"), createAdmin_1.createAdmin);
// User Activity Analytics
router.get("/user-activity", (0, requireRole_1.requireRole)("app_admin"), userActivityController_1.getUserActivity);
router.get("/user-activity/hourly", (0, requireRole_1.requireRole)("app_admin"), userActivityController_1.getHourlyActivity);
router.get("/user-activity/weekly", (0, requireRole_1.requireRole)("app_admin"), userActivityController_1.getWeeklyActivity);
router.get("/user-activity/categories", (0, requireRole_1.requireRole)("app_admin"), userActivityController_1.getActivityByCategory);
router.get("/user-activity/top-users", (0, requireRole_1.requireRole)("app_admin"), userActivityController_1.getTopActiveUsers);
router.get("/user-activity/user/:id", (0, requireRole_1.requireRole)("app_admin"), userActivityController_1.getUserActivityByUserId);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map