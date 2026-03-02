"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
// models/Audit.ts
const client_1 = __importDefault(require("../prisma/client")); // ✅ Correct import
const UserActivity_1 = require("./UserActivity"); // ⭐ Analytics tracking
async function logAudit({ action, targetType, targetId, performedBy = "system", actorUserId = null, clientGroupId, companyId, details = null, metadata = {} }) {
    // ⭐ 1. Create the audit log (unchanged)
    const audit = await client_1.default.audit.create({
        data: {
            action,
            targetType,
            targetId,
            performedBy: performedBy || String(actorUserId) || "system",
            actorUserId,
            clientGroupId,
            companyId,
            details,
            metadata
        }
    });
    // ⭐ 2. Record analytics (only when user + company exist)
    if (actorUserId && companyId) {
        await (0, UserActivity_1.recordUserActivity)({
            userId: actorUserId,
            companyId,
            category: action, // category = audit action
        });
    }
    return audit;
}
//# sourceMappingURL=Audit.js.map