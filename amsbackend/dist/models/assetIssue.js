"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIssueModel = createIssueModel;
exports.listIssuesModel = listIssuesModel;
exports.getIssueByIdModel = getIssueByIdModel;
exports.updateIssueModel = updateIssueModel;
exports.assignIssueModel = assignIssueModel;
exports.completeIssueModel = completeIssueModel;
exports.deleteIssueModel = deleteIssueModel;
const client_1 = require("../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
// Helper: tenant-aware check
function canAccessIssue(issue, group) {
    if (!issue)
        return false;
    if (group === "ALL")
        return true; // app_admin
    if (group === null)
        return issue.clientGroupId === null; // single_user
    return issue.clientGroupId === group; // company users
}
// ------------------------------------------------------
// CREATE ISSUE
// ------------------------------------------------------
async function createIssueModel(data) {
    return prismaClient().assetIssue.create({ data });
}
// ------------------------------------------------------
// LIST ISSUES (tenant-aware)
// ------------------------------------------------------
async function listIssuesModel(group) {
    const where = group === "ALL"
        ? {}
        : { clientGroupId: group };
    return prismaClient().assetIssue.findMany({
        where,
        orderBy: { id: "desc" },
        include: {
            asset: true,
            assignedUser: true,
            completedUser: true
        }
    });
}
// ------------------------------------------------------
// GET ISSUE BY ID
// ------------------------------------------------------
async function getIssueByIdModel(id, group) {
    const issue = await prismaClient().assetIssue.findUnique({ where: { id } });
    if (!canAccessIssue(issue, group))
        return null;
    return issue;
}
// ------------------------------------------------------
// UPDATE ISSUE
// ------------------------------------------------------
async function updateIssueModel(id, group, data) {
    const existing = await prismaClient().assetIssue.findUnique({ where: { id } });
    if (!canAccessIssue(existing, group))
        return null;
    return prismaClient().assetIssue.update({
        where: { id },
        data
    });
}
// ------------------------------------------------------
// ASSIGN ISSUE
// ------------------------------------------------------
async function assignIssueModel(id, group, assignedTo) {
    const existing = await prismaClient().assetIssue.findUnique({ where: { id } });
    if (!canAccessIssue(existing, group))
        return null;
    return prismaClient().assetIssue.update({
        where: { id },
        data: {
            assignedTo,
            assignedAt: new Date()
        }
    });
}
// ------------------------------------------------------
// COMPLETE ISSUE
// ------------------------------------------------------
async function completeIssueModel(id, group, completedBy) {
    const existing = await prismaClient().assetIssue.findUnique({ where: { id } });
    if (!canAccessIssue(existing, group))
        return null;
    return prismaClient().assetIssue.update({
        where: { id },
        data: {
            status: "completed",
            completedBy,
            completedAt: new Date()
        }
    });
}
// ------------------------------------------------------
// DELETE ISSUE (soft delete)
// ------------------------------------------------------
async function deleteIssueModel(id, group) {
    const existing = await prismaClient().assetIssue.findUnique({ where: { id } });
    if (!canAccessIssue(existing, group))
        return null;
    return prismaClient().assetIssue.update({
        where: { id },
        data: { status: "deleted" }
    });
}
//# sourceMappingURL=assetIssue.js.map