"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartupOptions = getStartupOptions;
async function getStartupOptions(req, res) {
    const { accountType, clientGroupId } = req.user || {};
    if (!accountType) {
        return res.status(400).json({ success: false, message: "Missing account type" });
    }
    if (accountType === "single") {
        return res.json({
            success: true,
            next: "personal_dashboard"
        });
    }
    if (accountType === "company" && clientGroupId) {
        return res.json({
            success: true,
            next: "company_dashboard"
        });
    }
    if (accountType === "company" && !clientGroupId) {
        return res.json({
            success: true,
            next: "join_client_group"
        });
    }
    return res.json({
        success: true,
        next: "unknown"
    });
}
//# sourceMappingURL=startupController.js.map