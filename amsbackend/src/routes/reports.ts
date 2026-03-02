import { Router, Request, Response } from "express";
import { streamExcel } from "../controllers/filesController";

const router = Router();

// ✅ Stream Excel or fallback file
router.get("/:type/:id", (req: Request, res: Response) => {
  return streamExcel(req, res);
});

export default router;