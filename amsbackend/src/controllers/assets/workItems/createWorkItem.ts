import { Request, Response } from "express";
import { getPrisma } from "../../../prisma/client";
function prismaClient() { return getPrisma(); }

export const createWorkItem = async (req: Request, res: Response) => {
  try {
    const {
      id,
      asset_id,
      work_item,
      possible_consequence,
      current_likelihood,
      current_severity,
      current_date_logged,
      risk_mitigation_proposals,
      mitigation_likelihood,
      mitigation_severity,
      mitigation_completion,
      status
    } = req.body;

    const created = await prismaClient().workItem.create({
      data: {
        id,
        asset_id,
        work_item,
        possible_consequence,
        current_likelihood: Number(current_likelihood),
        current_severity: Number(current_severity),
        current_rating: Number(current_likelihood) * Number(current_severity),
        current_date_logged: current_date_logged ? new Date(current_date_logged) : new Date(),
        risk_mitigation_proposals,
        mitigation_likelihood: Number(mitigation_likelihood),
        mitigation_severity: Number(mitigation_severity),
        mitigation_rating: Number(mitigation_likelihood) * Number(mitigation_severity),
        mitigation_completion: mitigation_completion ? new Date(mitigation_completion) : null,
        status
      }
    });

    res.json({ success: true, workItem: created });
  } catch (err) {
    console.error("Create work item error:", err);
    res.status(500).json({ error: "Failed to create work item" });
  }
};
