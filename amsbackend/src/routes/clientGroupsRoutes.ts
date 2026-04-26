import { Router } from "express";
import { getClientGroups, getClientGroupAssetSummary, createClientGroup, sendInviteEmail} from "../controllers/clientGroups/clientGroupsController";
import { attachUserContext  } from "../middleware/auth"; // adjust name if different
import { requireRole } from "../middleware/requireRole";
import { restoreClientGroup } from "../controllers/clientGroups/restoreClientGroups";
import { deleteClientGroup } from "../controllers/clientGroups/deleteClientGroups";
import { updateClientGroup } from "../controllers/clientGroups/updateClientGroups";

import { assignUserToClientGroup } from "../controllers/clientGroups/assignUserToClientGroup";
import { removeUserFromClientGroup } from "../controllers/clientGroups/removeUserFromClientGroup";
import { getUsersInClientGroup } from "../controllers/clientGroups/getUsersInClientGroup";
import { moveUserToAnotherGroup } from "../controllers/clientGroups/moveUserToAnotherGroup";
import { generateInviteToken } from "../controllers/clientGroups/generateInviteToken";
import { verifyInviteToken } from "../controllers/clientGroups/verifyInviteToken";
import {getClientGroupById} from "../controllers/clientGroups/getClientGroupById";
import {getClientGroupAuditLogs} from "../controllers/clientGroups/clientGroupAuditLogs"
const router = Router();
router.get("/verify-invite-token", verifyInviteToken);
router.use(attachUserContext);
router.get("/", requireRole("company_admin", "app_admin"), getClientGroups);
router.post("/",requireRole("company_admin", "app_admin"), createClientGroup);
router.put("/update", requireRole("company_admin", "app_admin"), updateClientGroup);
router.put( "/delete", requireRole("company_admin", "app_admin"), deleteClientGroup);
router.put( "/restore", requireRole("company_admin", "app_admin"), restoreClientGroup);


router.get("/assets-summary",requireRole("company_admin", "app_admin"), getClientGroupAssetSummary);
router.post( "/assign-user", requireRole("company_admin", "app_admin"), assignUserToClientGroup );
router.post( "/remove-user", requireRole("company_admin", "app_admin"), removeUserFromClientGroup );
router.get( "/:clientGroupId/users", requireRole("company_admin", "app_admin"), getUsersInClientGroup );
router.post( "/move-user", requireRole("company_admin", "app_admin"), moveUserToAnotherGroup );
router.get("/:groupId", requireRole("company_admin", "app_admin"), getClientGroupById);
router.get("/:groupId/audit-logs", requireRole("company_admin", "app_admin"), getClientGroupAuditLogs);
router.post("/send-invite",requireRole("company_admin", "app_admin"), sendInviteEmail);
router.post("/invite-token", requireRole("company_admin", "app_admin"), generateInviteToken);
export default router;
