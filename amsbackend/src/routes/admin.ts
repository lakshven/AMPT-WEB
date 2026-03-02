import express from "express";
import { attachUserContext } from "../middleware/auth";
import { requirePermission } from "../middleware/requirePermission";

import { assignRoleToUser } from "../controllers/admin/adminUserController";
import { addUserToGroup } from "../controllers/admin/adminGroupController";

const router = express.Router();

router.use(attachUserContext);

router.post("/users/:userId/role", assignRoleToUser);
router.post("/users/:userId/groups", requirePermission("MANAGE_USERS"), addUserToGroup);

export default router;