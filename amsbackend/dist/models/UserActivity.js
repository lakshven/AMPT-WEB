"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordUserActivity = recordUserActivity;
const client_1 = __importDefault(require("../prisma/client"));
async function recordUserActivity({ userId, companyId, category, }) {
    const now = new Date();
    const hour = now.toISOString().slice(11, 13) + ":00";
    const dayOfWeek = now.getDay();
    return client_1.default.userActivity.upsert({
        where: {
            hour_dayOfWeek_category: {
                hour,
                dayOfWeek,
                category,
            },
        },
        update: {
            count: { increment: 1 },
        },
        create: {
            userId,
            companyId,
            hour,
            dayOfWeek,
            category,
            count: 1,
        },
    });
}
//# sourceMappingURL=UserActivity.js.map