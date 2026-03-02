import { Request, Response } from "express";

export async function getStartupOptions(req: Request, res: Response) {
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