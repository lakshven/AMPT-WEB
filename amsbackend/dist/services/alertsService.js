"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlertIfNew = createAlertIfNew;
exports.getAlerts = getAlerts;
exports.markAlertsRead = markAlertsRead;
exports.deleteExpiredAlerts = deleteExpiredAlerts;
const client_1 = __importDefault(require("../prisma/client"));
async function createAlertIfNew(companyId, { type, message, severity }) {
    const recent = await client_1.default.systemAlert.findFirst({
        where: {
            type,
            severity,
            companyId,
            createdAt: {
                gte: new Date(Date.now() - 30 * 60 * 1000), // last 30 min
            },
        },
    });
    if (recent)
        return;
    await client_1.default.systemAlert.create({
        data: { type, message, severity, companyId },
    });
}
async function getAlerts() {
    return client_1.default.systemAlert.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
    });
}
async function markAlertsRead(ids) {
    return client_1.default.systemAlert.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true },
    });
}
async function deleteExpiredAlerts() {
    await client_1.default.systemAlert.deleteMany({
        where: {
            createdAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
        }
    });
}
//# sourceMappingURL=alertsService.js.map