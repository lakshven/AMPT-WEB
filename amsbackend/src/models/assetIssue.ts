import { getPrisma } from "../prisma/client";
function prismaClient() { return getPrisma(); }

// Helper: tenant-aware check
function canAccessIssue(
  issue: { clientGroupId: number | null } | null,
  group: number | null | "ALL"
) {
  if (!issue) return false;
  if (group === "ALL") return true;               // app_admin
  if (group === null) return issue.clientGroupId === null; // single_user
  return issue.clientGroupId === group;           // company users
}

// ------------------------------------------------------
// CREATE ISSUE
// ------------------------------------------------------
export async function createIssueModel(data: {
  assetId: number;
  code: string;
  title: string;
  issue: string;
  score: number | null;
  mitigation: string | null;
  clientGroupId: number | null; // allow null for single_user
}) {
  return prismaClient().assetIssue.create({ data });
}

// ------------------------------------------------------
// LIST ISSUES (tenant-aware)
// ------------------------------------------------------
export async function listIssuesModel(group: number | null | "ALL") {
  const where =
    group === "ALL"
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
export async function getIssueByIdModel(
  id: number,
  group: number | null | "ALL"
) {
  const issue = await prismaClient().assetIssue.findUnique({ where: { id } });

  if (!canAccessIssue(issue, group)) return null;

  return issue;
}

// ------------------------------------------------------
// UPDATE ISSUE
// ------------------------------------------------------
export async function updateIssueModel(
  id: number,
  group: number | null | "ALL",
  data: any
) {
  const existing = await prismaClient().assetIssue.findUnique({ where: { id } });

  if (!canAccessIssue(existing, group)) return null;

  return prismaClient().assetIssue.update({
    where: { id },
    data
  });
}

// ------------------------------------------------------
// ASSIGN ISSUE
// ------------------------------------------------------
export async function assignIssueModel(
  id: number,
  group: number | null | "ALL",
  assignedTo: number
) {
  const existing = await prismaClient().assetIssue.findUnique({ where: { id } });

  if (!canAccessIssue(existing, group)) return null;

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
export async function completeIssueModel(
  id: number,
  group: number | null | "ALL",
  completedBy: number
) {
  const existing = await prismaClient().assetIssue.findUnique({ where: { id } });

  if (!canAccessIssue(existing, group)) return null;

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
export async function deleteIssueModel(
  id: number,
  group: number | null | "ALL"
) {
  const existing = await prismaClient().assetIssue.findUnique({ where: { id } });

  if (!canAccessIssue(existing, group)) return null;

  return prismaClient().assetIssue.update({
    where: { id },
    data: { status: "deleted" }
  });
}