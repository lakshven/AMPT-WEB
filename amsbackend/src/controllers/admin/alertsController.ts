import { Request, Response } from "express";
import prisma from "../../prisma/client";
import { getAlerts, markAlertsRead } from "../../services/alertsService";

export const createAlert = async (req: Request, res: Response) => {
  try {
    const { type, message, severity } = req.body;

    const alert = await prisma.systemAlert.create({
      data: { type, message, severity }
    });

    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: "Failed to create alert" });
  }
};

export const listAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await getAlerts();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to load alerts" });
  }
};

export const markAlertsAsRead = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    await markAlertsRead(ids);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark alerts read" });
  }
};