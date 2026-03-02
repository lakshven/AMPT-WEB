"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
// controllers/audit/logAudit.ts
const client_1 = __importDefault(require("../../prisma/client"));
const client_2 = require("@prisma/client");
async function logAudit({ action, targetType, targetId = null, performedBy, clientGroupId = null, metadata = null, details = null, actorUserId = null }) {
    return client_1.default.audit.create({
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