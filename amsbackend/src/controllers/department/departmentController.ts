import { Request, Response } from "express";

export async function getDepartments(req: Request, res: Response) {
  try {
    const departments = [
      "Roads",
      "Bridges",
      "Water",
      "Buildings",
      "Electrical",
      "Mechanical",
      "Civil",
      "Transport",
      "Utilities",
      "Other (Type Manually)"
    ];

    return res.json({ success: true, departments });
  } catch (error) {
    console.error("Error loading departments:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}