import { Router } from "express";
import { workspaceController } from "./workspace.controller";
import { upsertWorkspaceSchema } from "./workspace.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const workspaceRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Workspace
 *   description: Persistent coding workspace state (autosave)
 */

/**
 * @swagger
 * /workspace/state:
 *   get:
 *     summary: Get user's saved workspace state
 *     description: Returns the last autosaved question, code, and editor settings. Returns null if no state saved yet.
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspace state (or null)
 */
workspaceRouter.get("/state", authenticate, asyncHandler(workspaceController.getState));

/**
 * @swagger
 * /workspace/state:
 *   post:
 *     summary: Create or update workspace state (autosave)
 *     description: Upserts the workspace state. Called every 30s from the frontend autosave timer.
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               draftCode:
 *                 type: string
 *                 nullable: true
 *               language:
 *                 type: string
 *                 enum: [javascript, python, cpp, java, typescript]
 *               editorSettings:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   fontSize:
 *                     type: number
 *                   theme:
 *                     type: string
 *                   tabSize:
 *                     type: number
 *                   wordWrap:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Workspace state saved
 */
workspaceRouter.post(
  "/state",
  authenticate,
  validate(upsertWorkspaceSchema),
  asyncHandler(workspaceController.saveState)
);

/**
 * @swagger
 * /workspace/state:
 *   patch:
 *     summary: Partial update of workspace state (autosave patch)
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Workspace state updated
 */
workspaceRouter.patch(
  "/state",
  authenticate,
  validate(upsertWorkspaceSchema),
  asyncHandler(workspaceController.saveState)
);

/**
 * @swagger
 * /workspace/state:
 *   delete:
 *     summary: Clear saved workspace state
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspace state cleared
 */
workspaceRouter.delete("/state", authenticate, asyncHandler(workspaceController.clearState));

export { workspaceRouter };
