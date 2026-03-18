"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordUserActivity = recordUserActivity;
const client_1 = require("../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
async function recordUserActivity({ userId, companyId, category, }) {
    const now = new Date();
    const hour = now.toISOString().slice(11, 13) + ":00";
    const dayOfWeek = now.getDay();
    return prismaClient().userActivity.upsert({
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