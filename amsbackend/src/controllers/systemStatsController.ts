import { Request, Response } from "express";
import { getSystemMetrics } from "../services/metricsService";

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await getSystemMetrics();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats" });
  }
};