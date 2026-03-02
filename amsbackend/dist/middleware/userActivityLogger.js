"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userActivityLogger = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const userActivityLogger = async (req, res, next) => {
    try {
        if (!req.user)
            return next();
        const now = new Date();
        // Hour bucket (00:00 → 23:00)
        const hour = now.toTimeString().slice(0, 5); // "14:00"
        // Day of week (0 = Sunday → 6 = Saturday)
        const dayOfWeek = now.getDay();
        // Use full URL for accurate category tracking
        const url = req.originalUrl;
        let category = "general";
        if (url.includes("/api/auth/login"))
            category = "login";
        else if (url.includes("/api/assets"))
            category = "asset_update";
        else if (url.includes("/api/issues"))
            category = "issue_creation";
        else if (url.includes("/api/admin/analytics"))
            category = "admin_activity";
        await client_1.default.userActivity.upsert({
            where: {
                hour_dayOfWeek_category: {
                    hour,
                    dayOfWeek,
                    category
                }
            },
            update: {
                count: { increment: 1 }
            },
            create: {
                hour,
                dayOfWeek,
                category,
                count: 1,
                userId: req.user.id
            }
        });
    }
    catch (err) {
        console.error("Failed to log user activity", err);
    }
    next();
};
exports.userActivityLogger = userActivityLogger;
//# sourceMappingURL=userActivityLogger.js.map