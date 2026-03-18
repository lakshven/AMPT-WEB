"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreIssue = exports.deleteIssue = exports.completeIssue = exports.assignIssue = exports.updateIssue = exports.getIssueById = exports.listIssues = exports.createIssue = void 0;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const Audit_1 = require("../../models/Audit");
// ⭐ NEW: Resolve company instead of client group
function resolveCompany(req, res) {
    const role = String(req.user?.role);
    const companyId = req.user?.companyId;
    if (role === "app_admin")
        return "ALL";
    if (role === "single_user")
        return null;
    if (companyId != null)
        return companyId;
    res.status(400).json({ error: "Missing companyId on user" });
    return null;
}
// CREATE ISSUE
const createIssue = async (req, res) => {
    const company = resolveCompany(req, res);
    if (company == null)
        return;
    try {
        const { assetId, title, issue, score, mitigation } = req.body;
        const code = `ISSUE-${Date.now()}`;
        // Fetch asset with companyId
        const asset = await prismaClient().assets.findUnique({
            where: { id: assetId },
            select: {
                clientGroupId: true,
                clientGroup: { select: { companyId: true } }
            }
        });
        if (!asset) {
            res.status(404).json({ error: "Asset not found" });
            return;
        }
        const assetCompanyId = asset.clientGroup?.companyId ?? null;
        const role = String(req.user?.role);
        const isAppAdmin = role === "app_admin";
        const isCompanyAdmin = role === "company_admin";
        const isCompanyUser = role === "company_user";
        if (!isAppAdmin && !isCompanyAdmin && !isCompanyUser) {
            return res.status(403).json({ error: "You are not allowed to create issues" });
        }
        // ⭐ Company-level isolation
        if (!isAppAdmin && assetCompanyId !== company) {
            return res.status(403).json({ error: "Not allowed to create issue for this asset" });
        }
        const newIssue = await prismaClient().assetIssue.create({
            data: {
                assetId,
                code,
                title,
                issue,
                score,
                mitigation,
                clientGroupId: asset.clientGroupId,
                companyId: assetCompanyId // ⭐ CRITICAL
            }
        });
        await (0, Audit_1.logAudit)({
            action: "issue_created",
            targetType: "issue",
            targetId: newIssue.id,
            performedBy: req.user.username,
            clientGroupId: asset.clientGroupId,
            companyId: assetCompanyId,
            metadata: { assetId, code, title, score, mitigation }
        });
        res.json({ success: true, issue: newIssue });
    }
    catch (err) {
        console.error("Create issue error:", err);
        await (0, Audit_1.logAudit)({
            action: "issue_create_error",
            targetType: "issue",
            targetId: null,
            performedBy: req.user ? req.user.username : "anonymous",
            actorUserId: req.user ? req.user.id : null,
            clientGroupId: req.user ? req.user.clientGroupId : null,
            companyId: req.user ? req.user.companyId : null,
            metadata: { error: String(err) }
        });
        res.status(500).json({ error: "Failed to create issue" });
    }
};
exports.createIssue = createIssue;
// LIST ISSUES
const listIssues = async (req, res) => {
    const company = resolveCompany(req, res);
    if (company == null)
        return;
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const skip = (page - 1) * pageSize;
    // ⭐ Support frontend toggle: deleted=true / deleted=false
    const showDeleted = req.query.deleted === "true";
    try {
        // ⭐ Build Prisma where clause correctly
        const where = company === "ALL"
            ? showDeleted
                ? {}
                : { status: { not: "deleted" } }
            : showDeleted
                ? { companyId: company }
                : { companyId: company, status: { not: "deleted" } };
        const [issues, total] = await Promise.all([
            prismaClient().assetIssue.findMany({
                where,
                orderBy: { id: "desc" },
                skip,
                take: pageSize,
                include: {
                    asset: true,
                    assignedUser: true,
                    completedUser: true
                }
            }),
            prismaClient().assetIssue.count({ where })
        ]);
        await (0, Audit_1.logAudit)({
            action: "issues_list_viewed",
            targetType: "issue",
            targetId: null,
            performedBy: req.user.username,
            clientGroupId: req.user.clientGroupId,
            companyId: req.user.companyId,
            metadata: { filter: company === "ALL" ? "ALL" : "COMPANY", page, pageSize, showDeleted }
        });
        res.json({
            items: issues,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    }
    catch (err) {
        console.error("List issues error:", err);
        await (0, Audit_1.logAudit)({
            action: "issues_list_error",
            targetType: "issue",
            targetId: null,
            performedBy: req.user ? req.user.username : "anonymous",
            clientGroupId: req.user ? req.user.clientGroupId : null,
            companyId: req.user ? req.user.companyId : null,
            metadata: { error: String(err) }
        });
        res.status(500).json({ error: "Failed to fetch issues" });
    }
};
exports.listIssues = listIssues;
// GET ISSUE BY ID
const getIssueById = async (req, res) => {
    const company = resolveCompany(req, res);
    if (company == null)
        return;
    const issueId = Number(req.params.id);
    try {
        const issue = await prismaClient().assetIssue.findUnique({ where: { id: issueId } });
        if (!issue) {
            res.status(404).json({ error: "Issue not found" });
            return;
        }
        const isAppAdmin = String(req.user?.role) === "app_admin";
        if (!isAppAdmin && issue.companyId !== company) {
            res.status(403).json({ error: "Not allowed to view this issue" });
            return;
        }
        await (0, Audit_1.logAudit)({
            action: "issue_viewed",
            targetType: "issue",
            targetId: issue.id,
            performedBy: req.user.username,
            clientGroupId: issue.clientGroupId,
            companyId: issue.companyId,
            metadata: {}
        });
        res.json(issue);
    }
    catch (err) {
        console.error("Get issue error:", err);
        await (0, Audit_1.logAudit)({
            action: "issue_view_error",
            targetType: "issue",
            targetId: issueId,
            performedBy: req.user ? req.user.username : "anonymous",
            clientGroupId: req.user ? req.user.clientGroupId : null,
            companyId: req.user ? req.user.companyId : null,
            metadata: { error: String(err) }
        });
        res.status(500).json({ error: "Failed to fetch issue" });
    }
};
exports.getIssueById = getIssueById;
// UPDATE ISSUE
const updateIssue = async (req, res) => {
    const company = resolveCompany(req, res);
    if (company == null)
        return;
    const issueId = Number(req.params.id);
    try {
        const existing = await prismaClient().assetIssue.findUnique({ where: { id: issueId } });
        if (!existing) {
            res.status(404).json({ error: "Issue not found" });
            return;
        }
        const role = String(req.user?.role);
        const isAppAdmin = role === "app_admin";
        const isCompanyAdmin = role === "company_admin";
        const isCompanyUser = role === "company_user";
        if (!isAppAdmin && !isCompanyAdmin && !isCompanyUser) {
            return res.status(403).json({ error: "You are not allowed to update issues" });
        }
        if (!isAppAdmin && existing.companyId !== company) {
            res.status(403).json({ error: "Not allowed to update this issue" });
            return;
        }
        const updated = await prismaClient().assetIssue.update({
            where: { id: issueId },
            data: req.body
        });
        await (0, Audit_1.logAudit)({
            action: "issue_updated",
            targetType: "issue",
            targetId: updated.id,
            performedBy: req.user.username,
            clientGroupId: updated.clientGroupId,
            companyId: updated.companyId,
            metadata: { updatedFields: req.body }
        });
        res.json({ success: true, issue: updated });
    }
    catch (err) {
        console.error("Update issue error:", err);
        await (0, Audit_1.logAudit)({
            action: "issue_update_error",
            targetType: "issue",
            targetId: issueId,
            performedBy: req.user ? req.user.username : "anonymous",
            clientGroupId: req.user ? req.user.clientGroupId : null,
            companyId: req.user ? req.user.companyId : null,
            metadata: { error: String(err) }
        });
        res.status(500).json({ error: "Failed to update issue" });
    }
};
exports.updateIssue = updateIssue;
// ASSIGN ISSUE
const assignIssue = async (req, res) => {
    const company = resolveCompany(req, res);
    if (company == null)
        return;
    const issueId = Number(req.params.id);
    const { assignedTo } = req.body;
    try {
        const issue = await prismaClient().assetIssue.findUnique({ where: { id: issueId } });
        if (!issue) {
            res.status(404).json({ error: "Issue not found" });
            return;
        }
        const role = String(req.user?.role);
        const isAppAdmin = role === "app_admin";
        const isCompanyAdmin = role === "company_admin";
        if (!isAppAdmin && !isCompanyAdmin) {
            return res.status(403).json({ error: "You are not allowed to assign issues" });
        }
        // ⭐ Issue must belong to same company
        if (!isAppAdmin && issue.companyId !== company) {
            return res.status(403).json({ error: "Not allowed to assign this issue" });
        }
        const user = await prismaClient().users.findUnique({ where: { id: assignedTo } });
        // ⭐ Assigned user must belong to same company
        if (!user || (!isAppAdmin && user.companyId !== company)) {
            return res.status(400).json({ error: "User not in your company" });
        }
        const updated = await prismaClient().assetIssue.update({
            where: { id: issueId },
            data: {
                assignedTo,
                assignedAt: new Date()
            }
        });
        await (0, Audit_1.logAudit)({
            action: "issue_assigned",
            targetType: "issue",
            targetId: updated.id,
            performedBy: req.user.username,
            clientGroupId: updated.clientGroupId,
            companyId: updated.companyId,
            metadata: { assignedTo, assignedAt: updated.assignedAt }
        });
        res.json({ success: true, issue: updated });
    }
    catch (err) {
        console.error("Assign issue error:", err);
        await (0, Audit_1.logAudit)({
            action: "issue_assign_error",
            targetType: "issue",
            targetId: issueId,
            performedBy: req.user ? req.user.username : "anonymous",
            clientGroupId: req.user ? req.user.clientGroupId : null,
            companyId: req.user ? req.user.companyId : null,
            metadata: { error: String(err) }
        });
        res.status(500).json({ error: "Failed to assign issue" });
    }
};
exports.assignIssue = assignIssue;
// COMPLETE ISSUE
const completeIssue = async (req, res) => {
    const company = resolveCompany(req, res);
    if (company == null)
        return;
    const issueId = Number(req.params.id);
    try {
        const issue = await prismaClient().assetIssue.findUnique({ where: { id: issueId } });
        const role = String(req.user?.role);
        const isAppAdmin = role === "app_admin";
        const isCompanyAdmin = role === "company_admin";
        if (!isAppAdmin && !isCompanyAdmin) {
            return res.status(403).json({ error: "You are not allowed to complete issues" });
        }
        if (!issue || (!isAppAdmin && issue.companyId !== company)) {
            res.status(404).json({ error: "Issue not found or not allowed" });
            return;
        }
        const updated = await prismaClient().assetIssue.update({
            where: { id: issueId },
            data: {
                status: "completed",
                completedBy: req.user.id,
                completedAt: new Date()
            }
        });
        await (0, Audit_1.logAudit)({
            action: "issue_completed",
            targetType: "issue",
            targetId: updated.id,
            performedBy: req.user.username,
            clientGroupId: updated.clientGroupId,
            companyId: updated.companyId,
            metadata: { completedBy: req.user.id, completedAt: updated.completedAt }
        });
        res.json({ success: true, issue: updated });
    }
    catch (err) {
        console.error("Complete issue error:", err);
        await (0, Audit_1.logAudit)({
            action: "issue_complete_error",
            targetType: "issue",
            targetId: issueId,
            performedBy: req.user ? req.user.username : "anonymous",
            clientGroupId: req.user ? req.user.clientGroupId : null,
            companyId: req.user ? req.user.companyId : null,
            metadata: { error: String(err) }
        });
        res.status(500).json({ error: "Failed to complete issue" });
    }
};
exports.completeIssue = completeIssue;
// DELETE ISSUE
const deleteIssue = async (req, res) => {
    const company = resolveCompany(req, res);
    if (company == null)
        return;
    const issueId = Number(req.params.id);
    try {
        const issue = await prismaClient().assetIssue.findUnique({ where: { id: issueId } });
        const role = String(req.user?.role);
        const isAppAdmin = role === "app_admin";
        const isCompanyAdmin = role === "company_admin";
        if (!isAppAdmin && !isCompanyAdmin) {
            return res.status(403).json({ error: "You are not allowed to delete issues" });
        }
        if (!issue || (!isAppAdmin && issue.companyId !== company)) {
            res.status(404).json({ error: "Issue not found or not allowed" });
            return;
        }
        const updated = await prismaClient().assetIssue.update({
            where: { id: issueId },
            data: { status: "deleted" }
        });
        await (0, Audit_1.logAudit)({
            action: "issue_soft_deleted",
            targetType: "issue",
            targetId: updated.id,
            performedBy: req.user.username,
            clientGroupId: updated.clientGroupId,
            companyId: updated.companyId,
            metadata: {}
        });
        res.json({ success: true, message: "Issue deleted" });
    }
    catch (err) {
        console.error("Delete issue error:", err);
        await (0, Audit_1.logAudit)({
            action: "issue_delete_error",
            targetType: "issue",
            targetId: issueId,
            performedBy: req.user ? req.user.username : "anonymous",
            clientGroupId: req.user ? req.user.clientGroupId : null,
            companyId: req.user ? req.user.companyId : null,
            metadata: { error: String(err) }
        });
        res.status(500).json({ error: "Failed to delete issue" });
    }
}; // RESTORE ISSUE
exports.deleteIssue = deleteIssue;
const restoreIssue = async (req, res) => {
    const company = resolveCompany(req, res);
    if (company == null)
        return;
    const issueId = Number(req.params.id);
    try {
        const issue = await prismaClient().assetIssue.findUnique({ where: { id: issueId } });
        if (!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }
        const role = String(req.user?.role);
        const isAppAdmin = role === "app_admin";
        const isCompanyAdmin = role === "company_admin";
        if (!isAppAdmin && !isCompanyAdmin) {
            return res.status(403).json({ error: "You are not allowed to restore issues" });
        }
        if (!isAppAdmin && issue.companyId !== company) {
            return res.status(403).json({ error: "Not allowed to restore this issue" });
        }
        const updated = await prismaClient().assetIssue.update({
            where: { id: issueId },
            data: { status: "open" }
        });
        await (0, Audit_1.logAudit)({
            action: "issue_restored",
            targetType: "issue",
            targetId: updated.id,
            performedBy: req.user.username,
            clientGroupId: updated.clientGroupId,
            companyId: updated.companyId,
            metadata: {}
        });
        res.json({ success: true, issue: updated });
    }
    catch (err) {
        console.error("Restore issue error:", err);
        await (0, Audit_1.logAudit)({
            action: "issue_restore_error",
            targetType: "issue",
            targetId: issueId,
            performedBy: req.user ? req.user.username : "anonymous",
            clientGroupId: req.user ? req.user.clientGroupId : null,
            companyId: req.user ? req.user.companyId : null,
            metadata: { error: String(err) }
        });
        res.status(500).json({ error: "Failed to restore issue" });
    }
};
exports.restoreIssue = restoreIssue;
//# sourceMappingURL=assetIssue.js.map