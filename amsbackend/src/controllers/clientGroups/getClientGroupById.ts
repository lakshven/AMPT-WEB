import { Request, Response } from "express";
import {getPrisma} from "../../prisma/client"; // adjust path if needed
function prismaClient() { return getPrisma(); }
export const getClientGroupById = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await prismaClient().clientGroup.findUnique({
      where: { id: Number(groupId) },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Client group not found",
      });
    }

    return res.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error("Error fetching client group:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching client group",
    });
  }
};
