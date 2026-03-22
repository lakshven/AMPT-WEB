import express from "express";
import { attachUserContext } from "../middleware/auth";

import { getUserById } from "../controllers/users/getUserById";
import { getUsers } from "../controllers/users/getUsers";
import { getAssignableUsers } from "../controllers/users/getAssignableUsers";

import { createUser } from "../controllers/users/createUser";
import { updateUser } from "../controllers/users/updateUser";
import { deleteUser } from "../controllers/users/deleteUser";
import { restoreUser } from "../controllers/users/restoreUser";
// ⭐ NEW IMPORT
import { upgradeToCompany } from "../controllers/auth/upgradeToCompanyController";

const router = express.Router();
// Full users list (pagination + filters)
router.get("/list", attachUserContext, getUsers);
router.get("/", attachUserContext, getAssignableUsers)
;
router.post("/", attachUserContext, createUser);
router.get("/:id", attachUserContext, getUserById);
router.put("/:id", attachUserContext, updateUser);
router.delete("/:id", attachUserContext, deleteUser);
router.put("/:id/restore", attachUserContext, restoreUser);

// ⭐ NEW ROUTE — Upgrade single_user → company_admin
router.patch("/:id/upgrade-to-company", attachUserContext, upgradeToCompany);

export default router;