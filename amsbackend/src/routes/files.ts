import { Router } from "express";
import { streamExcel } from "../controllers/filesController";

const router = Router();

// ⭐ Support frontend URL: /files/excel/:type/:id
router.get("/excel/:type/:id", (req, res) => {
  return streamExcel(req, res);
});

// ⭐ Support backend URL: /files/:type/:id
router.get("/:type/:id", (req, res) => {
  return streamExcel(req, res);
});

export default router;