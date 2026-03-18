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
exports.logAudit = logAudit;
// models/Audit.ts
const UserActivity_1 = require("./UserActivity"); // Analytics tracking
async function logAudit({ action, targetType, targetId, performedBy = "system", actorUserId = null, clientGroupId, companyId, details = null, metadata = {} }) {
    // 1. Create the audit log
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    const prisma = getPrisma();
    const audit = await prisma.audit.create({
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
    // 2. Record analytics (only when user + company exist)
    if (actorUserId && companyId) {
        await (0, UserActivity_1.recordUserActivity)({
            userId: actorUserId,
            companyId,
            category: action
        });
    }
    return audit;
}
//# sourceMappingURL=Audit.js.map