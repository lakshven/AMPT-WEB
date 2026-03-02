import { Router } from "express";
import {createIssue, listIssues, getIssueById, updateIssue, assignIssue, completeIssue, deleteIssue, restoreIssue } from "../controllers/assets/assetIssue"; // TS automatically resolves .ts

import { attachUserContext } from "../middleware/auth";
const router: Router = Router();

// All issue routes require authentication
router.use(attachUserContext);
// CREATE ISSUE
router.post("/", createIssue);

// LIST ALL ISSUES (for user's client group)
router.get("/", listIssues);

// GET ISSUE BY ID
router.get("/:id", getIssueById);

// UPDATE ISSUE
router.put("/:id", updateIssue);

// ASSIGN ISSUE
router.put("/:id/assign", assignIssue);

// COMPLETE ISSUE
router.put("/:id/complete", completeIssue);

// DELETE ISSUE (soft delete)
router.delete("/:id", deleteIssue);
// RESTORE ISSUE  ⭐ add this
router.patch("/:id/restore", restoreIssue);

export default router;
