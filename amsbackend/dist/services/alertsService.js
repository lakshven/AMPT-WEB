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
exports.createAlertIfNew = createAlertIfNew;
exports.getAlerts = getAlerts;
exports.markAlertsRead = markAlertsRead;
exports.deleteExpiredAlerts = deleteExpiredAlerts;
async function createAlertIfNew(companyId, { type, message, severity }) {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    const recent = await prismaClient().systemAlert.findFirst({
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
    await prismaClient().systemAlert.create({
        data: { type, message, severity, companyId },
    });
}
async function getAlerts() {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    return prismaClient().systemAlert.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
    });
}
async function markAlertsRead(ids) {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    return prismaClient().systemAlert.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true },
    });
}
async function deleteExpiredAlerts() {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    await prismaClient().systemAlert.deleteMany({
        where: {
            createdAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
        }
    });
}
//# sourceMappingURL=alertsService.js.map