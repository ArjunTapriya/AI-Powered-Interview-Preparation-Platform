import { Router } from "express";
import { questionGenerationController } from "./question-generation.controller";
import { authenticate } from "../../middleware/auth";
import { rbacMiddleware, Role } from "../../middleware/rbac.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const questionGenerationRouter = Router();

const adminOnly = [authenticate, rbacMiddleware([Role.ADMIN, Role.SUPER_ADMIN])];

/**
 * @swagger
 * tags:
 *   name: Question Generation
 *   description: AI-powered question generation (Admin only)
 */

/**
 * @swagger
 * /question-generation/generate:
 *   post:
 *     summary: Generate and persist a single AI question
 *     description: Generates a complete question (with hints, examples, editorials, test cases, starter code) via AI and saves to DB.
 *     tags: [Question Generation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topic, difficulty]
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "Array, Hash Table"
 *               difficulty:
 *                 type: string
 *                 enum: [Easy, Medium, Hard]
 *               type:
 *                 type: string
 *                 enum: [DSA, System_Design, Behavioral]
 *                 default: DSA
 *     responses:
 *       201:
 *         description: Question generated and saved
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
questionGenerationRouter.post(
  "/generate",
  ...adminOnly,
  asyncHandler(questionGenerationController.generate)
);

/**
 * @swagger
 * /question-generation/bulk-generate:
 *   post:
 *     summary: Start a bulk question generation job
 *     description: Asynchronously generates N questions. Returns a jobId to poll for status.
 *     tags: [Question Generation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topic, difficulty, count]
 *             properties:
 *               topic:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [Easy, Medium, Hard]
 *               type:
 *                 type: string
 *                 enum: [DSA, System_Design, Behavioral]
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *     responses:
 *       202:
 *         description: Bulk generation job started (check status via GET /status/:jobId)
 *       403:
 *         description: Admin access required
 */
questionGenerationRouter.post(
  "/bulk-generate",
  ...adminOnly,
  asyncHandler(questionGenerationController.bulkGenerate)
);

/**
 * @swagger
 * /question-generation/status/{jobId}:
 *   get:
 *     summary: Get bulk generation job status
 *     tags: [Question Generation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status (PENDING | RUNNING | DONE | FAILED)
 *       404:
 *         description: Job not found
 */
questionGenerationRouter.get(
  "/status/:jobId",
  ...adminOnly,
  asyncHandler(questionGenerationController.getJobStatus)
);

export { questionGenerationRouter };
