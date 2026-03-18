"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserActivityByUserId = exports.fetchTopActiveUsers = exports.fetchActivityByCategory = exports.fetchWeeklyActivity = exports.fetchHourlyActivity = exports.fetchUserActivity = void 0;
// ⭐ Existing function (kept exactly as you wrote it)
const fetchUserActivity = async () => {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    return prismaClient().userActivity.findMany({
        orderBy: { createdAt: "asc" }
    });
};
exports.fetchUserActivity = fetchUserActivity;
// ⭐ 1. Hourly activity (for 24-hour heatmap)
const fetchHourlyActivity = async () => {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    return prismaClient().userActivity.groupBy({
        by: ["hour"],
        _sum: { count: true },
        orderBy: { hour: "asc" }
    });
};
exports.fetchHourlyActivity = fetchHourlyActivity;
// ⭐ 2. Weekly activity (7×24 heatmap)
const fetchWeeklyActivity = async () => {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    return prismaClient().userActivity.groupBy({
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
const fetchActivityByCategory = async () => {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    return prismaClient().userActivity.groupBy({
        by: ["category"],
        _sum: { count: true },
        orderBy: { category: "asc" }
    });
};
exports.fetchActivityByCategory = fetchActivityByCategory;
// ⭐ 4. Top active users (bar chart)
const fetchTopActiveUsers = async () => {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    return prismaClient().userActivity.groupBy({
        by: ["userId"],
        _sum: { count: true },
        orderBy: { _sum: { count: "desc" } },
        take: 10
    });
};
exports.fetchTopActiveUsers = fetchTopActiveUsers;
// ⭐ 5. Per-user analytics (user detail page)
const fetchUserActivityByUserId = async (userId) => {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    return prismaClient().userActivity.findMany({
        where: { userId },
        orderBy: [
            { dayOfWeek: "asc" },
            { hour: "asc" }
        ]
    });
};
exports.fetchUserActivityByUserId = fetchUserActivityByUserId;
//# sourceMappingURL=userActivityService.js.map