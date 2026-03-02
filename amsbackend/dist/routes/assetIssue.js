"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assetIssue_1 = require("../controllers/assets/assetIssue"); // TS automatically resolves .ts
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All issue routes require authentication
router.use(auth_1.attachUserContext);
// CREATE ISSUE
router.post("/", assetIssue_1.createIssue);
// LIST ALL ISSUES (for user's client group)
router.get("/", assetIssue_1.listIssues);
// GET ISSUE BY ID
router.get("/:id", assetIssue_1.getIssueById);
// UPDATE ISSUE
router.put("/:id", assetIssue_1.updateIssue);
// ASSIGN ISSUE
router.put("/:id/assign", assetIssue_1.assignIssue);
// COMPLETE ISSUE
router.put("/:id/complete", assetIssue_1.completeIssue);
// DELETE ISSUE (soft delete)
router.delete("/:id", assetIssue_1.deleteIssue);
// RESTORE ISSUE  ⭐ add this
router.patch("/:id/restore", assetIssue_1.restoreIssue);
exports.default = router;
//# sourceMappingURL=assetIssue.js.map