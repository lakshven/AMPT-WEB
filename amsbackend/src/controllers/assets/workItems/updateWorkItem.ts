import { Request, Response } from "express";
import { getPrisma } from "../../../prisma/client";
function prismaClient() { return getPrisma(); }

export const updateWorkItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const {
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

   const data: any = {};

   if (work_item !== undefined) data.work_item = work_item;
   if (possible_consequence !== undefined) data.possible_consequence = possible_consequence;
   if (risk_mitigation_proposals !== undefined) data.risk_mitigation_proposals = risk_mitigation_proposals;
   if (status !== undefined) data.status = status;

   if (current_likelihood !== undefined && current_severity !== undefined) {
    data.current_likelihood = Number(current_likelihood);
    data.current_severity = Number(current_severity);
    data.current_rating = Number(current_likelihood) * Number(current_severity);
   }

   if (current_date_logged !== undefined) {
    data.current_date_logged = new Date(current_date_logged);
   }

   if (mitigation_likelihood !== undefined && mitigation_severity !== undefined) {
    data.mitigation_likelihood = Number(mitigation_likelihood);
    data.mitigation_severity = Number(mitigation_severity);
    data.mitigation_rating = Number(mitigation_likelihood) * Number(mitigation_severity);
   }

   if (mitigation_completion !== undefined) {
    data.mitigation_completion = mitigation_completion ? new Date(mitigation_completion) : null;
   }

   const updated = await prismaClient().workItem.update({
    where: { id },
    data
   });
    res.json({ success: true, workItem: updated });
  } catch (err) {
    console.error("Update work item error:", err);
    res.status(500).json({ error: "Failed to update work item" });
  }
};
