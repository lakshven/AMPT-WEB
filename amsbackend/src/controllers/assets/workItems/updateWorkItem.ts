import { Request, Response } from "express";
import { getPrisma } from "../../../prisma/client";
function prismaClient() { return getPrisma(); }

export const updateWorkItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const clean = (value: any) =>
      value === "" || value === null || value === undefined ? undefined : value;

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

    if (clean(work_item) !== undefined) data.work_item = work_item;
    if (clean(possible_consequence) !== undefined) data.possible_consequence = possible_consequence;
    if (clean(risk_mitigation_proposals) !== undefined) data.risk_mitigation_proposals = risk_mitigation_proposals;
    if (clean(status) !== undefined) data.status = status;

    const cl = clean(current_likelihood);
    const cs = clean(current_severity);

    if (cl !== undefined && cs !== undefined) {
      data.current_likelihood = Number(cl);
      data.current_severity = Number(cs);
      data.current_rating = Number(cl) * Number(cs);
    }

    if (clean(current_date_logged) !== undefined) {
      data.current_date_logged = new Date(current_date_logged);
    }

    const ml = clean(mitigation_likelihood);
    const ms = clean(mitigation_severity);

    if (ml !== undefined && ms !== undefined) {
      data.mitigation_likelihood = Number(ml);
      data.mitigation_severity = Number(ms);
      data.mitigation_rating = Number(ml) * Number(ms);
    }

    if (mitigation_completion !== undefined) {
      data.mitigation_completion =
        mitigation_completion ? new Date(mitigation_completion) : null;
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
