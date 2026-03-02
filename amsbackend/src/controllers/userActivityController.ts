import { Request, Response } from "express";
import {
  fetchUserActivity,
  fetchHourlyActivity,
  fetchWeeklyActivity,
  fetchActivityByCategory,
  fetchTopActiveUsers,
  fetchUserActivityByUserId
} from "../services/userActivityService";

export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const data = await fetchUserActivity();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load user activity" });
  }
};

export const getHourlyActivity = async (req: Request, res: Response) => {
  try {
    const data = await fetchHourlyActivity();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load hourly activity" });
  }
};

export const getWeeklyActivity = async (req: Request, res: Response) => {
  try {
    const data = await fetchWeeklyActivity();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load weekly activity" });
  }
};

export const getActivityByCategory = async (req: Request, res: Response) => {
  try {
    const data = await fetchActivityByCategory();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load category activity" });
  }
};

export const getTopActiveUsers = async (req: Request, res: Response) => {
  try {
    const data = await fetchTopActiveUsers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load top users" });
  }
};

export const getUserActivityByUserId = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const data = await fetchUserActivityByUserId(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load user analytics" });
  }
};