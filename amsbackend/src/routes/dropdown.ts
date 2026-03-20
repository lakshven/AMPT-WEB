import { Router } from "express";
import getStaticOptions from "../controllers/dropdown/dropDownController";
import getAllDropdowns from "../controllers/dropdown/getAllDropdowns";

import addValue from "../controllers/dropdown/addValue";
import deleteValue from "../controllers/dropdown/deleteValue";
import restoreValue from "../controllers/dropdown/restoreValue";
import {getDeletedValues} from "../controllers/dropdown/getDeletedValues";
import restoreAll from "../controllers/dropdown/restoreAll";
import { requireRole } from "../middleware/requireRole";
import { attachUserContext } from "../middleware/auth";

const router = Router();
router.use(attachUserContext);
//router.get("/static", getStaticOptions);
router.get("/all", getAllDropdowns);

router.post("/:category", requireRole("app_admin"), addValue);
router.delete("/:category/:value", requireRole("app_admin"), deleteValue);
router.get("/:category/deleted", requireRole("app_admin"), getDeletedValues);
router.post("/:category/:value/restore", requireRole("app_admin"), restoreValue);
router.post("/:category/restore-all", requireRole("app_admin"), restoreAll);

export default router;
