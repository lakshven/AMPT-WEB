import { Router } from "express";
import { getStartupOptions } from "../controllers/startup/startupController";
import { attachUserContext } from "../middleware/auth";

const router = Router();

router.get("/startup", attachUserContext, getStartupOptions);

export default router;