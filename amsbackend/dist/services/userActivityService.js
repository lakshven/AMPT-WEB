"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserActivityByUserId = exports.fetchTopActiveUsers = exports.fetchActivityByCategory = exports.fetchWeeklyActivity = exports.fetchHourlyActivity = exports.fetchUserActivity = void 0;
const client_1 = __importDefault(require("../prisma/client"));
// ⭐ Existing function (kept exactly as you wrote it)
const fetchUserActivity = () => {
    return client_1.default.userActivity.findMany({
        orderBy: { createdAt: "asc" }
    });
};
exports.fetchUserActivity = fetchUserActivity;
// ⭐ 1. Hourly activity (for 24-hour heatmap)
const fetchHourlyActivity = () => {
    return client_1.default.userActivity.groupBy({
        by: ["hour"],
        _sum: { count: true },
        orderBy: { hour: "asc" }
    });
};
exports.fetchHourlyActivity = fetchHourlyActivity;
// ⭐ 2. Weekly activity (7×24 heatmap)
const fetchWeeklyActivity = () => {
    return client_1.default.userActivity.groupBy({
        by: ["dayOfWeek", "hour"],
        _sum: { count: true },
        _min: { createdAt: true }, // to get date for each day
        orderBy: [
            { dayOfWeek: "asc" },
            { hour: "asc" }
        ]
    });
};
exports.fetchWeeklyActivity = fetchWeeklyActivity;
// ⭐ 3. Activity by category (pie chart)
const fetchActivityByCategory = () => {
    return client_1.default.userActivity.groupBy({
        by: ["category"],
        _sum: { count: true },
        orderBy: { category: "asc" }
    });
};
exports.fetchActivityByCategory = fetchActivityByCategory;
// ⭐ 4. Top active users (bar chart)
const fetchTopActiveUsers = () => {
    return client_1.default.userActivity.groupBy({
        by: ["userId"],
        _sum: { count: true },
        orderBy: { _sum: { count: "desc" } },
        take: 10
    });
};
exports.fetchTopActiveUsers = fetchTopActiveUsers;
// ⭐ 5. Per-user analytics (user detail page)
const fetchUserActivityByUserId = (userId) => {
    return client_1.default.userActivity.findMany({
        where: { userId },
        orderBy: [
            { dayOfWeek: "asc" },
            { hour: "asc" }
        ]
    });
};
exports.fetchUserActivityByUserId = fetchUserActivityByUserId;
//# sourceMappingURL=userActivityService.js.map