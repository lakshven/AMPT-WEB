"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserActivityByUserId = exports.getTopActiveUsers = exports.getActivityByCategory = exports.getWeeklyActivity = exports.getHourlyActivity = exports.getUserActivity = void 0;
const userActivityService_1 = require("../services/userActivityService");
const getUserActivity = async (req, res) => {
    try {
        const data = await (0, userActivityService_1.fetchUserActivity)();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to load user activity" });
    }
};
exports.getUserActivity = getUserActivity;
const getHourlyActivity = async (req, res) => {
    try {
        const data = await (0, userActivityService_1.fetchHourlyActivity)();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to load hourly activity" });
    }
};
exports.getHourlyActivity = getHourlyActivity;
const getWeeklyActivity = async (req, res) => {
    try {
        const data = await (0, userActivityService_1.fetchWeeklyActivity)();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to load weekly activity" });
    }
};
exports.getWeeklyActivity = getWeeklyActivity;
const getActivityByCategory = async (req, res) => {
    try {
        const data = await (0, userActivityService_1.fetchActivityByCategory)();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to load category activity" });
    }
};
exports.getActivityByCategory = getActivityByCategory;
const getTopActiveUsers = async (req, res) => {
    try {
        const data = await (0, userActivityService_1.fetchTopActiveUsers)();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to load top users" });
    }
};
exports.getTopActiveUsers = getTopActiveUsers;
const getUserActivityByUserId = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const data = await (0, userActivityService_1.fetchUserActivityByUserId)(userId);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to load user analytics" });
    }
};
exports.getUserActivityByUserId = getUserActivityByUserId;
//# sourceMappingURL=userActivityController.js.map