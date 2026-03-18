"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
// controllers/audit/logAudit.ts
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const client_2 = require("@prisma/client");
async function logAudit({ action, targetType, targetId = null, performedBy, clientGroupId = null, metadata = null, details = null, actorUserId = null }) {
    return prismaClient().audit.create({
        data: {
            action,
            targetType,
            targetId,
            performedBy,
            clientGroupId,
            details: details === null ? client_2.Prisma.JsonNull : details,
            // Prisma requires JsonNull instead of plain null
            metadata: metadata === null ? client_2.Prisma.JsonNull : metadata,
            actorUserId
        }
    });
}
//# sourceMappingURL=logAudit.js.map