import { Router } from "express";
import { createWorkItem } from "../controllers/assets/workItems/createWorkItem";
import { updateWorkItem } from "../controllers/assets/workItems/updateWorkItem";
import { deleteWorkItem } from "../controllers/assets/workItems/deleteWorkItem";
import { getWorkItem } from "../controllers/assets/workItems/getWorkItem";
import { listWorkItems } from "../controllers/assets/workItems/listWorkItems";
import {attachUserContext} from "../middleware/auth";

const router = Router();

// Create a work item
router.post("/", attachUserContext, createWorkItem);

// Update a work item
router.put("/:id", attachUserContext, updateWorkItem);

// Delete a work item
router.delete("/:id", attachUserContext, deleteWorkItem);

// Get a single work item
router.get("/:id", attachUserContext, getWorkItem);

// List all work items for an asset
router.get("/asset/:assetId", attachUserContext, listWorkItems);

export default router;
